from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.coupure import Coupure
from app.models.signalement import Signalement
from app.models.consommation import Consommation
from app.models.utilisateur import Utilisateur
from app.models.quartier import Quartier

class StatistiqueService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats_par_periode(self, debut: datetime, fin: datetime) -> dict:
        nb_coupures = self.db.query(Coupure).filter(
            Coupure.date_debut >= debut, Coupure.date_debut <= fin
        ).count()

        duree_totale = self.db.query(func.sum(Coupure.duree_minutes)).filter(
            Coupure.date_debut >= debut, Coupure.date_debut <= fin
        ).scalar() or 0

        nb_signalements = self.db.query(Signalement).filter(
            Signalement.date_signalement >= debut, Signalement.date_signalement <= fin
        ).count()

        return {
            "periode": {"debut": debut, "fin": fin},
            "nb_coupures": nb_coupures,
            "duree_totale_minutes": int(duree_totale),
            "nb_signalements": nb_signalements
        }

    def get_stats_par_quartier(self, id_quartier: int = None) -> list[dict]:
        query = self.db.query(
            Quartier.id_quartier,
            Quartier.nom_quartier,
            func.count(Coupure.id_coupure).label("nb_coupures"),
            func.avg(Coupure.duree_minutes).label("duree_moyenne")
        ).join(Coupure, Quartier.id_quartier == Coupure.id_quartier).group_by(Quartier.id_quartier)

        if id_quartier:
            query = query.filter(Quartier.id_quartier == id_quartier)

        result = query.all()
        return [{"id_quartier": r.id_quartier, "nom_quartier": r.nom_quartier, "nb_coupures": r.nb_coupures, "duree_moyenne": float(r.duree_moyenne or 0)} for r in result]

    def get_tendance_consommation(self, id_quartier: int, jours: int = 7) -> list[dict]:
        date_limit = datetime.now() - timedelta(days=jours)

        result = self.db.query(
            func.date(Consommation.date_heure).label("jour"),
            func.avg(Consommation.valeur).label("moyenne")
        ).filter(
            Consommation.id_quartier == id_quartier,
            Consommation.date_heure >= date_limit
        ).group_by(func.date(Consommation.date_heure)).order_by(func.date(Consommation.date_heure)).all()

        return [{"jour": str(r.jour), "moyenne": float(r.moyenne)} for r in result]

    def get_stats_globales(self) -> dict:
        """Récupère les statistiques globales pour le dashboard"""
        import traceback
        try:
            total_coupures = self.db.query(Coupure).count()
            total_signalements = self.db.query(Signalement).count()
            total_utilisateurs = self.db.query(Utilisateur).count()
            total_quartiers = self.db.query(Quartier).count()

            # Compter les coupures en cours
            coupures_en_cours = self.db.query(Coupure).filter(Coupure.statut == "en_cours").count()

            # Compter les signalements en attente
            signalements_en_attente = self.db.query(Signalement).filter(Signalement.statut == "en_attente").count()

            # Durée moyenne des coupures (uniquement celles qui sont terminées)
            duree_moyenne = self.db.query(func.avg(Coupure.duree_minutes)).filter(
                Coupure.duree_minutes.isnot(None)
            ).scalar() or 0

            return {
                "total_coupures": total_coupures,
                "total_signalements": total_signalements,
                "total_utilisateurs": total_utilisateurs,
                "total_quartiers": total_quartiers,
                "coupures_en_cours": coupures_en_cours,
                "signalements_en_attente": signalements_en_attente,
                "duree_moyenne_coupures": float(duree_moyenne)
            }
        except Exception as e:
            print(f"Erreur dans get_stats_globales: {e}")
            return {
                "total_coupures": 0,
                "total_signalements": 0,
                "total_utilisateurs": 0,
                "total_quartiers": 0,
                "coupures_en_cours": 0,
                "signalements_en_attente": 0,
                "duree_moyenne_coupures": 0
            }
