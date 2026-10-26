from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.utilisateur import UtilisateurResponse
from app.services.analyste_service import AnalysteService
from app.services.utilisateur_service import UtilisateurService
from app.api.deps import get_current_admin

router = APIRouter(prefix="/analystes", tags=["Analystes"])

@router.get("/", response_model=List[UtilisateurResponse])
def get_all_analystes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère tous les analystes (admin uniquement)"""
    analyste_service = AnalysteService(db)
    analystes = analyste_service.get_all(skip=skip, limit=limit)

    utilisateur_service = UtilisateurService(db)
    result = []
    for a in analystes:
        user = utilisateur_service.get_by_id(a.id_analyste)
        if user:
            result.append(user)
    return result
