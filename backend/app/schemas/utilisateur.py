from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UtilisateurBase(BaseModel):
    nom: str
    email: EmailStr
    telephone: Optional[str] = None
    statut: str = "actif"
    id_role: int
    id_ville: int

class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str

class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    statut: Optional[str] = None
    id_ville: Optional[int] = None

class UtilisateurResponse(UtilisateurBase):
    id_utilisateur: int
    date_creation: datetime

    class Config:
        from_attributes = True
