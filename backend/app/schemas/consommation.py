from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConsommationBase(BaseModel):
    date_heure: datetime
    valeur: float
    unite: Optional[str] = None
    source: Optional[str] = None
    id_quartier: int

class ConsommationCreate(ConsommationBase):
    id_coupure: Optional[int] = None

class ConsommationUpdate(BaseModel):
    valeur: Optional[float] = None
    source: Optional[str] = None

class ConsommationResponse(ConsommationBase):
    id_consommation: int
    id_coupure: Optional[int] = None

    class Config:
        from_attributes = True
