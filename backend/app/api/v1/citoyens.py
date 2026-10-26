from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.utilisateur import UtilisateurResponse
from app.services.citoyen_service import CitoyenService
from app.services.utilisateur_service import UtilisateurService
from app.api.deps import get_current_admin, get_current_user

router = APIRouter(prefix="/citoyens", tags=["Citoyens"])

@router.get("/", response_model=List[UtilisateurResponse])
def get_all_citoyens(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère tous les citoyens (admin uniquement)"""
    citoyen_service = CitoyenService(db)
    citoyens = citoyen_service.get_all(skip=skip, limit=limit)

    # Récupère les infos utilisateur pour chaque citoyen
    utilisateur_service = UtilisateurService(db)
    result = []
    for citoyen in citoyens:
        user = utilisateur_service.get_by_id(citoyen.id_citoyen)
        if user:
            result.append(user)
    return result

@router.get("/{citoyen_id}", response_model=UtilisateurResponse)
def get_citoyen(
    citoyen_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère un citoyen par son ID"""
    if current_user.id_utilisateur != citoyen_id and current_user.role.nom_role != "administrateur":
        raise HTTPException(status_code=403, detail="Non autorisé")

    utilisateur_service = UtilisateurService(db)
    user = utilisateur_service.get_by_id(citoyen_id)
    if not user:
        raise HTTPException(status_code=404, detail="Citoyen non trouvé")
    return user
