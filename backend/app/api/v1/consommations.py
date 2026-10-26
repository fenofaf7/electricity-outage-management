from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.schemas.consommation import ConsommationCreate, ConsommationResponse
from app.services.consommation_service import ConsommationService
from app.api.deps import get_current_analyste

router = APIRouter(prefix="/consommations", tags=["Consommations"])

@router.get("/", response_model=List[ConsommationResponse])
def get_all_consommations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_analyste)
):
    """Récupère toutes les consommations (analyste uniquement)"""
    service = ConsommationService(db)
    return service.get_all(skip=skip, limit=limit)

@router.get("/quartier/{quartier_id}", response_model=List[ConsommationResponse])
def get_consommations_by_quartier(
    quartier_id: int,
    debut: datetime = None,
    fin: datetime = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_analyste)
):
    """Récupère les consommations d'un quartier"""
    service = ConsommationService(db)
    return service.get_by_quartier(quartier_id, debut, fin)

@router.post("/", response_model=ConsommationResponse)
def create_consommation(
    data: ConsommationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_analyste)
):
    """Crée une nouvelle consommation"""
    service = ConsommationService(db)
    return service.create(data.dict())
