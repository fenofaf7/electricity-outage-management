from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.statistique import DashboardData
from app.services.dashboard_service import DashboardService
from app.api.deps import get_current_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=DashboardData)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère les données du dashboard (admin uniquement)"""
    service = DashboardService(db)

    stats_globales = service.get_stats_globales()
    top_quartiers = service.get_top_quartiers_impactes()
    predictions = service.get_predictions_risques()

    return DashboardData(
        stats_globales=stats_globales,
        top_quartiers_impactes=top_quartiers,
        predictions_risques=predictions,
        coupures_en_cours=stats_globales["coupures_en_cours"],
        signalements_en_attente=stats_globales["signalements_en_attente"]
    )
