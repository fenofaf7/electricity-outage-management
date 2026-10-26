from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.quartier import QuartierResponse
from app.services.quartier_service import QuartierService

router = APIRouter(prefix="/quartiers", tags=["Quartiers"])

@router.get("/", response_model=List[QuartierResponse])
def get_all_quartiers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère tous les quartiers"""
    service = QuartierService(db)
    return service.get_all(skip=skip, limit=limit)

@router.get("/{quartier_id}", response_model=QuartierResponse)
def get_quartier(
    quartier_id: int,
    db: Session = Depends(get_db)
):
    """Récupère un quartier par son ID"""
    service = QuartierService(db)
    quartier = service.get_by_id(quartier_id)
    if not quartier:
        raise HTTPException(status_code=404, detail="Quartier non trouvé")
    return quartier

@router.get("/ville/{ville_id}/", response_model=List[QuartierResponse])
def get_quartiers_by_ville(
    ville_id: int,
    db: Session = Depends(get_db)
):
    """Récupère tous les quartiers d'une ville"""
    service = QuartierService(db)
    return service.get_quartiers_by_ville(ville_id)
