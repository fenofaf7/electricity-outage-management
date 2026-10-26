from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RapportBase(BaseModel):
    titre: str
    contenu: Optional[str] = None
    type_rapport: Optional[str] = None
    statut: str = "brouillon"
    id_admin_user: int

class RapportCreate(RapportBase):
    id_coupure: Optional[int] = None

class RapportUpdate(BaseModel):
    titre: Optional[str] = None
    contenu: Optional[str] = None
    statut: Optional[str] = None

class RapportResponse(RapportBase):
    id_rapport: int
    date_creation: datetime
    id_coupure: Optional[int] = None

    class Config:
        from_attributes = True
