from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.rapport import Rapport
from app.api.deps import get_current_user, get_current_admin, get_current_analyste
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/rapports", tags=["Rapports"])

class RapportCreate(BaseModel):
    titre: str
    contenu: str
    type_rapport: str
    id_coupure: Optional[int] = None

class RapportResponse(BaseModel):
    id_rapport: int
    titre: str
    contenu: Optional[str]
    date_creation: datetime
    type_rapport: Optional[str]
    statut: Optional[str]
    id_admin_user: Optional[int]
    id_coupure: Optional[int]

# Changement ici : utiliser get_current_user (analyste ou admin)
@router.get("/", response_model=List[RapportResponse])
def get_all_rapports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # ← modifié
):
    """Récupère tous les rapports (analyste ou admin)"""
    rapports = db.query(Rapport).order_by(Rapport.date_creation.desc()).offset(skip).limit(limit).all()
    return rapports

# Changement ici : autoriser analyste et admin
@router.post("/", response_model=RapportResponse)
def create_rapport(
    rapport: RapportCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # ← modifié
):
    """Crée un nouveau rapport (analyste ou admin)"""
    new_rapport = Rapport(
        titre=rapport.titre,
        contenu=rapport.contenu,
        type_rapport=rapport.type_rapport,
        id_admin_user=current_user.id_utilisateur,  # ← l'utilisateur connecté
        id_coupure=rapport.id_coupure,
        statut="brouillon"
    )
    db.add(new_rapport)
    db.commit()
    db.refresh(new_rapport)
    return new_rapport

@router.put("/{rapport_id}/publier")
def publier_rapport(
    rapport_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Publie un rapport (change statut de brouillon à publie)"""
    rapport = db.query(Rapport).filter(Rapport.id_rapport == rapport_id).first()
    if not rapport:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")

    rapport.statut = "publie"
    db.commit()
    db.refresh(rapport)

    return {
        "message": "Rapport publié avec succès",
        "id_rapport": rapport.id_rapport,
        "statut": rapport.statut
    }

@router.delete("/{rapport_id}")
def delete_rapport(
    rapport_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)  # seule suppression reste admin
):
    """Supprime un rapport (admin uniquement)"""
    rapport = db.query(Rapport).filter(Rapport.id_rapport == rapport_id).first()
    if not rapport:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")

    db.delete(rapport)
    db.commit()
    return {"message": "Rapport supprimé"}
