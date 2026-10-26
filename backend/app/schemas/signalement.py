from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SignalementBase(BaseModel):
    description: str
    type_signalement: Optional[str] = None
    statut: str = "en_attente"
    id_quartier: int
    id_citoyen: int

class SignalementCreate(SignalementBase):
    pass

class SignalementUpdate(BaseModel):
    description: Optional[str] = None
    statut: Optional[str] = None
    id_coupure: Optional[int] = None

class SignalementResponse(SignalementBase):
    id_signalement: int
    date_signalement: datetime
    id_coupure: Optional[int] = None

    class Config:
        from_attributes = True
