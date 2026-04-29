# ML prediction logic
import json
import os
from datetime import datetime
from typing import Optional, Tuple, List, Dict

import numpy as np
import pandas as pd
import lightgbm as lgb
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
P50_PATH = os.path.join(MODEL_DIR, "lgbm_model_p50.txt")
P75_PATH = os.path.join(MODEL_DIR, "lgbm_model_p75.txt")
P90_PATH = os.path.join(MODEL_DIR, "lgbm_model_p90.txt")
ENCODER_PATH = os.path.join(MODEL_DIR, "encoder.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_list.json")

class ModelBundle:
    """
    Holds LGB quantile models + encoder + feature list.
    If not available, API falls back to historical median from MSSQL.
    """
    def __init__(self):
        self.model_p50: Optional[lgb.Booster] = None
        self.model_p75: Optional[lgb.Booster] = None
        self.model_p90: Optional[lgb.Booster] = None
        self.encoder: Optional[Dict] = None
        self.features: Optional[List[str]] = None
        self.model_version: str = "fallback_v0"
        self._try_load()

    def _try_load(self):
        try:
            if os.path.exists(P50_PATH):
                self.model_p50 = lgb.Booster(model_file=P50_PATH)
            if os.path.exists(P75_PATH):
                self.model_p75 = lgb.Booster(model_file=P75_PATH)
            if os.path.exists(P90_PATH):
                self.model_p90 = lgb.Booster(model_file=P90_PATH)
            if os.path.exists(ENCODER_PATH):
                self.encoder = joblib.load(ENCODER_PATH)
            if os.path.exists(FEATURES_PATH):
                with open(FEATURES_PATH, "r", encoding="utf-8") as f:
                    self.features = json.load(f)

            if self.model_p50 and self.features:
                self.model_version = f"lgbm_quantile_{datetime.now().date().isoformat()}"
        except Exception as e:
            # Leave as None for fallback mode
            print(f"[WARN] Failed to load model artifacts: {e}")

    def ready(self) -> bool:
        return self.model_p50 is not None and self.encoder is not None and self.features is not None

MODEL = ModelBundle()

# ---------- Helpers ----------

COLOR_FAMILY_MAP = {
    "navy": "blue", "royal": "blue", "sky": "blue", "blue": "blue",
    "black": "black", "white": "white", "offwhite": "white", "ivory": "white",
    "red": "red", "maroon": "red", "burgundy": "red",
    "green": "green", "olive": "green",
    "yellow": "yellow", "mustard": "yellow",
    "pink": "pink", "magenta": "pink",
    "purple": "purple", "violet": "purple",
    "grey": "grey", "gray": "grey", "charcoal": "grey",
    "beige": "brown", "brown": "brown", "khaki": "brown",
}

def color_family(color: Optional[str]) -> Optional[str]:
    if not color:
        return None
    c = color.strip().lower()
    if c in COLOR_FAMILY_MAP:
        return COLOR_FAMILY_MAP[c]
    for k, v in COLOR_FAMILY_MAP.items():
        if k in c:
            return v
    return c

def style_group(style: Optional[str]) -> Optional[str]:
    if not style:
        return None
    return style.strip().upper()[:5]


def build_feature_row(req: dict, aggregates: dict) -> pd.DataFrame:
    row = {
        "style": req.get("style"),
        "qty": req.get("qty"),
    }
    df = pd.DataFrame([row])
    # Ensure all training features exist
    if MODEL.features:
        for col in MODEL.features:
            if col not in df.columns:
                df[col] = np.nan
        df = df[MODEL.features]
    if MODEL.encoder:
        cat_cols = MODEL.encoder.get("categorical", [])
        enc = MODEL.encoder.get("encoder")
        if enc and cat_cols:
            df[cat_cols] = (
                df[cat_cols]
                .astype(str)
                .fillna("__MISSING__")
            )
            df[cat_cols] = enc.transform(df[cat_cols])
    return df


def predict_quantiles(xrow: pd.DataFrame) -> Tuple[float, float, float]:
    p50 = float(MODEL.model_p50.predict(xrow)[0]) if MODEL.model_p50 else None
    p75 = float(MODEL.model_p75.predict(xrow)[0]) if MODEL.model_p75 else None
    p90 = float(MODEL.model_p90.predict(xrow)[0]) if MODEL.model_p90 else None
    return p50, p75, p90
