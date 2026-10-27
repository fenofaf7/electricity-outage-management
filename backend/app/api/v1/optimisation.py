from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.algorithms.glouton_db import GestionDelestageDB
from app.api.deps import get_current_user, get_current_gestionnaire

router = APIRouter(prefix="/optimisation", tags=["Optimisation"])


@router.post("/delestage/planifier")
def planifier_delestage(
    puissance_disponible: float = Query(..., description="Puissance disponible en MW"),
    puissance_securite: float = Query(10, description="Marge de sécurité en MW"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    """Planifie le délestage (algorithme glouton)"""

    gestion = GestionDelestageDB(db)
    return gestion.planifier_delestage(puissance_disponible, puissance_securite)


@router.post("/delestage/optimiser")
def optimiser_delestage(
    puissance_disponible: float = Query(..., description="Puissance disponible en MW"),
    duree_max: int = Query(120, description="Durée max par quartier en minutes"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    """Optimise le délestage avec rotation"""

    gestion = GestionDelestageDB(db)
    return gestion.optimiser_delestage(puissance_disponible, duree_max)


@router.get("/delestage/recommandation")
def get_recommandation_delestage(
    puissance_disponible: float = Query(100, description="Puissance disponible en MW"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Donne une recommandation de délestage"""

    gestion = GestionDelestageDB(db)
    return gestion.get_recommandation(puissance_disponible)
