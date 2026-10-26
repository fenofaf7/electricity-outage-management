from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.schemas.statistique import StatsGlobales, StatsQuartier, StatsPeriode
from app.services.statistique_service import StatistiqueService
from app.api.deps import get_current_user

router = APIRouter(prefix="/statistiques", tags=["Statistiques"])

@router.get("/globales")
def get_stats_globales(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère les statistiques globales"""
    service = StatistiqueService(db)
    stats = service.get_stats_globales()
    return stats

@router.get("/par-quartier", response_model=list[StatsQuartier])
def get_stats_par_quartier(
    quartier_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère les statistiques par quartier"""
    service = StatistiqueService(db)
    return service.get_stats_par_quartier(quartier_id)

@router.get("/par-periode", response_model=StatsPeriode)
def get_stats_par_periode(
    debut: datetime,
    fin: datetime,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère les statistiques sur une période"""
    service = StatistiqueService(db)
    return service.get_stats_par_periode(debut, fin)
