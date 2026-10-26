from pydantic import BaseModel
from typing import Optional

class QuartierBase(BaseModel):
    nom_quartier: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    statut: str = "actif"
    id_ville: int

class QuartierCreate(QuartierBase):
    pass

class QuartierUpdate(BaseModel):
    nom_quartier: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    statut: Optional[str] = None

class QuartierResponse(QuartierBase):
    id_quartier: int

    class Config:
        from_attributes = True
