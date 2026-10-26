from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Statistiques générales
class StatsGlobales(BaseModel):
    total_coupures: int
    total_signalements: int
    total_utilisateurs: int
    total_quartiers: int
    duree_moyenne_coupures: float
    taux_resolution: float

# Statistiques par quartier
class StatsQuartier(BaseModel):
    id_quartier: int
    nom_quartier: str
    nb_coupures: int
    nb_signalements: int
    duree_totale_minutes: int
    duree_moyenne_minutes: float

# Statistiques par période
class StatsPeriode(BaseModel):
    periode: str  # jour, semaine, mois, annee
    nb_coupures: int
    duree_totale_minutes: int

# Prédiction risque
class RisquePrediction(BaseModel):
    id_quartier: int
    nom_quartier: str
    niveau_risque: str  # faible, moyen, élevé, critique
    probabilite: float
    date_prediction: datetime
    facteurs: Optional[List[str]] = None

# Dashboard admin
class DashboardData(BaseModel):
    stats_globales: StatsGlobales
    top_quartiers_impactes: List[StatsQuartier]
    predictions_risques: List[RisquePrediction]
    coupures_en_cours: int
    signalements_en_attente: int
