# SHAP explainer utilities
from typing import List, Dict
import numpy as np
import shap
import pandas as pd
from app.ml.predict import MODEL

# Lazy-initialized global explainer for P50 model
_explainer = None

def _get_explainer():
    global _explainer
    if _explainer is None and MODEL.model_p50 is not None:
        _explainer = shap.TreeExplainer(MODEL.model_p50)
    return _explainer

def reason_codes_from_model(xrow: pd.DataFrame, top_n: int = 5) -> List[Dict]:
    exp = _get_explainer()
    if exp is None:
        return []
    # SHAP returns a vector per row (we pass one row)
    sv = exp.shap_values(xrow)[0]
    if isinstance(sv, list):  # compatibility
        sv = sv[0]
    sv = np.array(sv)
    order = np.argsort(np.abs(sv))[::-1]
    reasons = []
    for idx in order[:top_n]:
        reasons.append({
            "feature": xrow.columns[idx],
            "direction": "up" if sv[idx] >= 0 else "down",
            "impact": float(sv[idx])
        })
    return reasons