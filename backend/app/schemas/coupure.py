from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CoupureBase(BaseModel):
    date_debut: datetime
    date_fin: Optional[datetime] = None
    type_coupure: Optional[str] = None
    cause: Optional[str] = None
    statut: str = "en_cours"
    id_quartier: int

class CoupureCreate(CoupureBase):
    pass

class CoupureUpdate(BaseModel):
    date_fin: Optional[datetime] = None
    type_coupure: Optional[str] = None
    cause: Optional[str] = None
    statut: Optional[str] = None

class CoupureResponse(CoupureBase):
    id_coupure: int
    duree_minutes: Optional[int] = None

    class Config:
        from_attributes = True
