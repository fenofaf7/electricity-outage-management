from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionBase(BaseModel):
    date_prediction: datetime
    probabilite: Optional[float] = None
    niveau_risque: Optional[str] = None
    algorithme: Optional[str] = None
    horizon: Optional[str] = None
    id_quartier: int

class PredictionCreate(PredictionBase):
    id_coupure: Optional[int] = None

class PredictionResponse(PredictionBase):
    id_prediction: int
    id_coupure: Optional[int] = None

    class Config:
        from_attributes = True
