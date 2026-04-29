# Prediction router
from datetime import datetime
from typing import List, Dict, Any

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.schemas.prediction_schema import PredictionRequest, PredictionResponse, ReasonCode, SimilarPO
from app.ml.predict import MODEL, build_feature_row, predict_quantiles, color_family
from app.utils.shap_explainer import reason_codes_from_model

router = APIRouter(tags=["Prediction"])

YARD_TO_METER = 0.9144

def _df_from_query(db: Session, sql: str, params: Dict[str, Any]) -> pd.DataFrame:
    """
    Execute SQL and return DataFrame with column names.
    """
    result = db.execute(text(sql), params)
    rows = result.mappings().all()
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows)

def _compute_per_piece(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    df = df.copy()
    # normalize units to meters
    df["unit"] = df["unit"].astype(str).str.lower()
    df["actual_total_meters"] = np.where(
        df["unit"].str.startswith("yard"),
        df["actual_consumption_total"].astype(float) * YARD_TO_METER,
        df["actual_consumption_total"].astype(float)
    )
    df["actual_per_piece"] = df["actual_total_meters"] / df["order_qty"].clip(lower=1)
    return df

def _similar_history(db: Session, req: PredictionRequest, limit: int = 300) -> pd.DataFrame:
    """
    Fetch recent, similar rows given the optional filters. Uses OFFSET/FETCH for parametrized LIMIT.
    """
    filters = []
    params: Dict[str, Any] = {}

    if req.fabric_type:
        filters.append("fabric_type = :fabric_type")
        params["fabric_type"] = req.fabric_type
    if req.style:
        filters.append("style = :style")
        params["style"] = req.style

    # Prefer color_family if available in your table
    cf = color_family(req.color) if req.color else None
    if cf:
        filters.append("color_family = :color_family")
        params["color_family"] = cf

    if req.buyer:
        filters.append("buyer = :buyer")
        params["buyer"] = req.buyer
    if req.supplier:
        filters.append("supplier = :supplier")
        params["supplier"] = req.supplier
    if req.season:
        filters.append("season = :season")
        params["season"] = req.season

    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    sql = f"""
        SELECT
            id, style, po, color, fabric_type, buyer, season, supplier, factory,
            po_date, order_qty, unit, actual_consumption_total,
            gsm, width_mm, shrinkage_warp_pct, shrinkage_weft_pct, marker_efficiency_pct, wash_type,
            color_family
        FROM fact_fabric_consumption
        {where}
        ORDER BY po_date DESC
        OFFSET 0 ROWS
        FETCH NEXT :limit ROWS ONLY;
    """
    params["limit"] = limit
    df = _df_from_query(db, sql, params)
    return _compute_per_piece(df)

def _choose_reason_codes(xrow: pd.DataFrame, hist_df: pd.DataFrame) -> List[Dict]:
    """
    Try SHAP-based reasons; fallback to simple heuristics when no model yet.
    """
    rc = reason_codes_from_model(xrow)
    if rc:
        return rc

    reasons: List[Dict] = []
    if not hist_df.empty:
        # Example heuristics comparing request vs historical medians
        for f in []: #"marker_efficiency_pct", "shrinkage_weft_pct", "shrinkage_warp_pct"
            if f in hist_df.columns and hist_df[f].notna().any() and f in xrow.columns:
                req_val = float(xrow.iloc[0][f]) if pd.notna(xrow.iloc[0][f]) else None
                med_val = float(hist_df[f].median()) if pd.notna(hist_df[f]).any() else None
                if req_val is not None and med_val is not None:
                    delta = req_val - med_val
                    reasons.append({
                        "feature": f,
                        "direction": "up" if delta > 0 else "down",
                        "impact": round(abs(delta) * 0.001, 4)  # small heuristic magnitude
                    })
    return reasons[:5]

def _similar_pos_for_response(df: pd.DataFrame, n: int = 5) -> List[Dict]:
    if df.empty:
        return []
    sdf = df.copy()
    sdf["po_date"] = pd.to_datetime(sdf["po_date"], errors="coerce")
    sdf = sdf.sort_values(["po_date"], ascending=[False]).head(200)
    target_qty = float(sdf["order_qty"].median())
    sdf["qty_diff"] = (sdf["order_qty"] - target_qty).abs()
    sdf = sdf.sort_values(["qty_diff", "po_date"]).head(n)
    out = []
    for _, r in sdf.iterrows():
        out.append({
            "po": r.get("po"),
            "style": r.get("style"),
            "color": r.get("color"),
            "fabric_type": r.get("fabric_type"),
            "actual_per_piece": float(r.get("actual_per_piece")) if pd.notna(r.get("actual_per_piece")) else None,
            "order_qty": float(r.get("order_qty")) if pd.notna(r.get("order_qty")) else None,
            "date": r.get("po_date").date().isoformat() if pd.notna(r.get("po_date")) else None
        })
    return out

@router.post("/predict", response_model=PredictionResponse)

def predict(req: PredictionRequest, db: Session = Depends(get_db)):
    """
    Predict per-piece fabric consumption (meters per unit) using LightGBM quantile models
    if available, else historical median. Multiply by qty to return total consumption.
    """
    if req.qty <= 0:
        raise HTTPException(status_code=400, detail="qty must be > 0")

    # Only use style for history
    hist_df = _df_from_query(db, """
        SELECT style, po, order_qty, unit, actual_consumption_total
        FROM fact_fabric_consumption
        WHERE style = :style
        ORDER BY po_date DESC
        OFFSET 0 ROWS FETCH NEXT 1000 ROWS ONLY;
    """, {"style": req.style})
    working_df = _compute_per_piece(hist_df)
    hist_count = int(len(working_df))

    agg_median = float(working_df["actual_per_piece"].median()) if not working_df.empty else np.nan
    aggregates = {
        "hist_median_per_piece": agg_median if not np.isnan(agg_median) else None,
        "hist_count": hist_count if hist_count > 0 else int(len(working_df)),
        "supplier_bias": None,
    }

    req_dict = req.model_dump()
    xrow = build_feature_row(req_dict, aggregates)

    if MODEL.ready():
        try:
            p50, p75, p90 = predict_quantiles(xrow)
            model_version = MODEL.model_version
        except Exception as e:
            print(f"[WARN] Model prediction failed: {e}")
            p50 = aggregates["hist_median_per_piece"]
            p75 = p50
            p90 = p50
            model_version = "fallback_hist_median"
    else:
        p50 = aggregates["hist_median_per_piece"]
        p75 = p50
        p90 = p50
        model_version = "fallback_hist_median"

    qty = req.qty
    def total(v: float | None) -> float | None:
        return float(v * qty) if v is not None else None

    return PredictionResponse(
        po=None,
        style=req.style,
        color=None,
        fabric_type=None,
        unit="meters",
        prediction={
            "per_piece": {
                "p50": float(p50) if p50 is not None else None,
                "p75": float(p75) if p75 is not None else None,
                "p90": float(p90) if p90 is not None else None
            },
            "total": {
                "p50": total(p50),
                "p75": total(p75),
                "p90": total(p90)
            }
        },
        reason_codes=[],
        similar_past_pos=[],
        data_timestamp=datetime.utcnow().isoformat() + "Z",
        model_version=model_version,
        notes="P75 recommended; uses model if available, else historical median."
    )