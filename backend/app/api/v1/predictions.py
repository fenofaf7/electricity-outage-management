from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.prediction import Prediction
from app.models.quartier import Quartier
from app.algorithms.prediction import (
    calculer_risque_coupure,
    calculer_risques_tous_quartiers,
    generer_et_sauvegarder_prediction
)
from app.api.deps import get_current_user, get_current_analyste
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/predictions", tags=["Prédictions"])

class PredictionResponse(BaseModel):
    id_prediction: int
    id_quartier: int
    probabilite: float
    niveau_risque: str
    date_prediction: datetime
    horizon: Optional[str]
    recommandation: Optional[str]

class RisqueResponse(BaseModel):
    id_quartier: int
    probabilite: float
    niveau_risque: str
    details: dict

@router.get("/risque/{quartier_id}", response_model=RisqueResponse)
def get_risque_quartier(
    quartier_id: int,
    jours: int = Query(30, description="Nombre de jours d'historique"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Calcule le risque de coupure pour un quartier (algorithme probabiliste)"""

    # Vérifier que le quartier existe
    quartier = db.query(Quartier).filter(Quartier.id_quartier == quartier_id).first()
    if not quartier:
        raise HTTPException(status_code=404, detail="Quartier non trouvé")

    resultat = calculer_risque_coupure(db, quartier_id, jours)
    return resultat


@router.get("/tous-quartiers", response_model=List[RisqueResponse])
def get_risques_tous_quartiers(
    jours: int = Query(30, description="Nombre de jours d'historique"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Calcule les risques pour tous les quartiers (trié par risque décroissant)"""
    resultats = calculer_risques_tous_quartiers(db, jours)
    return resultats


@router.post("/generer/{quartier_id}")
def generer_prediction(
    quartier_id: int,
    jours: int = 30,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_analyste)
):
    """Génère une prédiction et la sauvegarde dans la base (analyste uniquement)"""

    resultat = generer_et_sauvegarder_prediction(db, quartier_id, jours)
    return resultat


@router.get("/historique/{quartier_id}", response_model=List[PredictionResponse])
def get_historique_predictions(
    quartier_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère l'historique des prédictions pour un quartier"""

    predictions = db.query(Prediction).filter(
        Prediction.id_quartier == quartier_id
    ).order_by(Prediction.date_prediction.desc()).offset(skip).limit(limit).all()

    return predictions


@router.get("/", response_model=List[PredictionResponse])
def get_all_predictions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère toutes les prédictions"""

    predictions = db.query(Prediction).order_by(
        Prediction.date_prediction.desc()
    ).offset(skip).limit(limit).all()

    return predictions
