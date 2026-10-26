from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.utilisateur import UtilisateurResponse, UtilisateurUpdate
from app.services.utilisateur_service import UtilisateurService
from app.api.deps import get_current_admin, get_current_user
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/utilisateurs", tags=["Utilisateurs"])

@router.get("/", response_model=List[UtilisateurResponse])
def get_all_utilisateurs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    service = UtilisateurService(db)
    return service.get_all(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UtilisateurResponse)
def get_utilisateur(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    service = UtilisateurService(db)
    user = service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/{user_id}", response_model=UtilisateurResponse)
def update_utilisateur(
    user_id: int,
    data: UtilisateurUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.id_utilisateur != user_id and current_user.role.nom_role != "administrateur":
        raise HTTPException(status_code=403, detail="Non autorisé")

    service = UtilisateurService(db)
    user = service.update(user_id, data.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


# ========== ENDPOINTS CORRIGÉS ==========

@router.put("/{user_id}/suspendre")
def suspendre_utilisateur(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Suspend un utilisateur (admin uniquement)"""

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id_utilisateur == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    if utilisateur.id_utilisateur == current_user.id_utilisateur:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas vous suspendre vous-même")

    # Changer le statut de 'actif' à 'inactif'
    utilisateur.statut = "inactif"
    db.commit()
    db.refresh(utilisateur)

    return {
        "message": f"Utilisateur {utilisateur.nom} suspendu",
        "id_utilisateur": utilisateur.id_utilisateur,
        "statut": utilisateur.statut
    }


@router.put("/{user_id}/reactiver")
def reactiver_utilisateur(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Réactive un utilisateur suspendu (admin uniquement)"""

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id_utilisateur == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Changer le statut de 'inactif' à 'actif'
    utilisateur.statut = "actif"
    db.commit()
    db.refresh(utilisateur)

    return {
        "message": f"Utilisateur {utilisateur.nom} réactivé",
        "id_utilisateur": utilisateur.id_utilisateur,
        "statut": utilisateur.statut
    }


@router.delete("/{user_id}")
def delete_utilisateur(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Supprime un utilisateur (admin uniquement)"""

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id_utilisateur == user_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    if utilisateur.id_utilisateur == current_user.id_utilisateur:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas vous supprimer vous-même")

    db.delete(utilisateur)
    db.commit()

    return {"message": f"Utilisateur {utilisateur.nom} supprimé"}


@router.get("/me/", response_model=UtilisateurResponse)
def get_current_user_info(
    current_user = Depends(get_current_user)
):
    return current_user
