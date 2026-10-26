from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.algorithms.dijkstra_db import ReseauElectriqueDB
from app.api.deps import get_current_user

router = APIRouter(prefix="/reseau", tags=["Réseau"])

@router.get("/chemin/{source}/{destination}")
def get_chemin(
    source: int,
    destination: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Trouve le chemin optimal entre deux quartiers"""
    reseau = ReseauElectriqueDB(db)
    return reseau.chemin_optimal(source, destination)
