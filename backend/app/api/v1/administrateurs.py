from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.utilisateur import UtilisateurResponse
from app.services.administrateur_service import AdministrateurService
from app.services.utilisateur_service import UtilisateurService
from app.api.deps import get_current_admin

router = APIRouter(prefix="/administrateurs", tags=["Administrateurs"])

@router.get("/", response_model=List[UtilisateurResponse])
def get_all_administrateurs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère tous les administrateurs (admin uniquement)"""
    admin_service = AdministrateurService(db)
    admins = admin_service.get_all(skip=skip, limit=limit)

    utilisateur_service = UtilisateurService(db)
    result = []
    for admin in admins:
        user = utilisateur_service.get_by_id(admin.id_administrateur)
        if user:
            result.append(user)
    return result

@router.get("/{admin_id}", response_model=UtilisateurResponse)
def get_administrateur(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère un administrateur par son ID"""
    utilisateur_service = UtilisateurService(db)
    user = utilisateur_service.get_by_id(admin_id)
    if not user:
        raise HTTPException(status_code=404, detail="Administrateur non trouvé")
    return user
