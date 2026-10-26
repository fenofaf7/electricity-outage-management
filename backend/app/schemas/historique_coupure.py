from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HistoriqueCoupureBase(BaseModel):
    date_debut: datetime
    date_fin: Optional[datetime] = None
    duree_minutes: Optional[int] = None
    frequence: Optional[int] = None
    commentaire: Optional[str] = None
    id_coupure: int

class HistoriqueCoupureCreate(HistoriqueCoupureBase):
    pass

class HistoriqueCoupureUpdate(BaseModel):
    commentaire: Optional[str] = None

class HistoriqueCoupureResponse(HistoriqueCoupureBase):
    id_historique: int

    class Config:
        from_attributes = True
