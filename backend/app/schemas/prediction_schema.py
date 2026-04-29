from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List

class PredictionRequest(BaseModel):
    style: str = Field(..., description="Style code")
    qty: int = Field(..., gt=0, description="Order quantity (units)")

    model_config = ConfigDict(extra="ignore")

class ReasonCode(BaseModel):
    feature: str
    direction: str  # "up" or "down"
    impact: float   # SHAP impact or heuristic magnitude

class SimilarPO(BaseModel):
    po: Optional[str]
    style: Optional[str]
    color: Optional[str]
    fabric_type: Optional[str]
    actual_per_piece: Optional[float]
    order_qty: Optional[float]
    date: Optional[str]

class PredictionResponse(BaseModel):
    po: Optional[str]
    style: Optional[str]
    color: Optional[str]
    fabric_type: Optional[str]
    unit: str = "meters"

    prediction: Dict[str, Dict[str, float]]  # per_piece + total with p50/p75/p90
    reason_codes: List[ReasonCode]
    similar_past_pos: List[SimilarPO]

    data_timestamp: str
    model_version: str
    notes: Optional[str] = None