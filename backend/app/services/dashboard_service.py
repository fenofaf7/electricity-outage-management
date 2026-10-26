from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.coupure import Coupure
from app.models.signalement import Signalement
from app.models.utilisateur import Utilisateur
from app.models.quartier import Quartier
from app.models.prediction import Prediction

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats_globales(self) -> dict:
        total_coupures = self.db.query(Coupure).count()
        total_signalements = self.db.query(Signalement).count()
        total_utilisateurs = self.db.query(Utilisateur).count()
        total_quartiers = self.db.query(Quartier).count()
        coupures_en_cours = self.db.query(Coupure).filter(Coupure.statut == "en_cours").count()
        signalements_en_attente = self.db.query(Signalement).filter(Signalement.statut == "en_attente").count()

        duree_moyenne = self.db.query(func.avg(Coupure.duree_minutes)).scalar() or 0

        return {
            "total_coupures": total_coupures,
            "total_signalements": total_signalements,
            "total_utilisateurs": total_utilisateurs,
            "total_quartiers": total_quartiers,
            "coupures_en_cours": coupures_en_cours,
            "signalements_en_attente": signalements_en_attente,
            "duree_moyenne_coupures": float(duree_moyenne)
        }

    def get_top_quartiers_impactes(self, limit: int = 5) -> list[dict]:
        result = self.db.query(
            Quartier.id_quartier,
            Quartier.nom_quartier,
            func.count(Coupure.id_coupure).label("nb_coupures")
        ).join(Coupure, Quartier.id_quartier == Coupure.id_quartier).group_by(
            Quartier.id_quartier
        ).order_by(func.count(Coupure.id_coupure).desc()).limit(limit).all()

        return [{"id_quartier": r.id_quartier, "nom_quartier": r.nom_quartier, "nb_coupures": r.nb_coupures} for r in result]

    def get_predictions_risques(self, limit: int = 5) -> list[dict]:
        result = self.db.query(
            Prediction.id_prediction,
            Prediction.probabilite,
            Prediction.niveau_risque,
            Quartier.nom_quartier
        ).join(Quartier, Prediction.id_quartier == Quartier.id_quartier).order_by(
            Prediction.probabilite.desc()
        ).limit(limit).all()

        return [{"id_prediction": r.id_prediction, "quartier": r.nom_quartier, "probabilite": r.probabilite, "niveau_risque": r.niveau_risque} for r in result]
