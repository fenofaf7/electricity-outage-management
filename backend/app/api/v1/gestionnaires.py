from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.utilisateur import UtilisateurResponse
from app.services.gestionnaire_service import GestionnaireService
from app.services.utilisateur_service import UtilisateurService
from app.api.deps import get_current_admin

router = APIRouter(prefix="/gestionnaires", tags=["Gestionnaires"])

@router.get("/", response_model=List[UtilisateurResponse])
def get_all_gestionnaires(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère tous les gestionnaires (admin uniquement)"""
    gestionnaire_service = GestionnaireService(db)
    gestionnaires = gestionnaire_service.get_all(skip=skip, limit=limit)

    utilisateur_service = UtilisateurService(db)
    result = []
    for g in gestionnaires:
        user = utilisateur_service.get_by_id(g.id_gestionnaire)
        if user:
            result.append(user)
    return result
