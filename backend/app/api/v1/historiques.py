from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.historique_coupure import HistoriqueCoupureResponse
from app.services.historique_service import HistoriqueService
from app.api.deps import get_current_analyste

router = APIRouter(prefix="/historiques", tags=["Historiques"])

@router.get("/", response_model=List[HistoriqueCoupureResponse])
def get_all_historiques(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_analyste)
):
    """Récupère tous les historiques (analyste uniquement)"""
    service = HistoriqueService(db)
    return service.get_all(skip=skip, limit=limit)

@router.get("/coupure/{coupure_id}", response_model=List[HistoriqueCoupureResponse])
def get_historique_by_coupure(
    coupure_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_analyste)
):
    """Récupère l'historique d'une coupure"""
    service = HistoriqueService(db)
    return service.get_by_coupure(coupure_id)
