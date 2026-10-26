"""
Intégration de l'algorithme glouton avec la base de données
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.algorithms.glouton import planifier_delestage, calculer_priorite_quartier, optimiser_delestage
from app.models.quartier import Quartier
from app.models.coupure import Coupure
from app.models.consommation import Consommation

class GestionDelestageDB:
    """Version avec base de données"""

    def __init__(self, db: Session):
        self.db = db

    def _get_consommation_quartier(self, id_quartier: int) -> float:
        """Récupère la consommation actuelle d'un quartier"""

        # Récupérer la dernière consommation
        conso = self.db.query(Consommation).filter(
            Consommation.id_quartier == id_quartier
        ).order_by(Consommation.date_heure.desc()).first()

        return conso.valeur if conso else 25.0  # Valeur par défaut

    def _get_historique_pannes(self, id_quartier: int, jours: int = 30) -> int:
        """Récupère le nombre de pannes récentes"""

        date_limite = datetime.now() - timedelta(days=jours)

        return self.db.query(Coupure).filter(
            Coupure.id_quartier == id_quartier,
            Coupure.date_debut >= date_limite
        ).count()

    def _get_priorite_quartier(self, id_quartier: int) -> int:
        """Calcule la priorité d'un quartier depuis la base"""

        quartier = self.db.query(Quartier).filter(
            Quartier.id_quartier == id_quartier
        ).first()

        if not quartier:
            return 3

        # Récupérer les données du quartier
        # Dans une vraie base, ces données viendraient de tables dédiées
        population = 30000  # À remplacer par des données réelles
        hopitaux = 1 if id_quartier in [86, 89] else 0
        industries = 2 if id_quartier in [86, 90] else 0
        pannes = self._get_historique_pannes(id_quartier)
        est_sensible = id_quartier in [86, 89, 93]  # Zones sensibles

        return calculer_priorite_quartier(
            population=population,
            hopitaux=hopitaux,
            industries=industries,
            pannes_historiques=pannes,
            est_zone_sensible=est_sensible
        )

    def get_quartiers_avec_consommation(self) -> list:
        """Récupère tous les quartiers avec leur consommation et priorité"""

        quartiers = self.db.query(Quartier).all()
        resultats = []

        for q in quartiers:
            resultats.append({
                "id": q.id_quartier,
                "nom": q.nom_quartier,
                "consommation": self._get_consommation_quartier(q.id_quartier),
                "priorite": self._get_priorite_quartier(q.id_quartier)
            })

        return resultats

    def planifier_delestage(self, puissance_disponible: float, puissance_securite: float = 10) -> dict:
        """Planifie le délestage avec les données réelles de la base"""

        quartiers = self.get_quartiers_avec_consommation()

        # Utiliser l'algorithme glouton
        resultat = planifier_delestage(quartiers, puissance_disponible, puissance_securite)

        return {
            "status": "success",
            "puissance_disponible": puissance_disponible,
            "puissance_securite": puissance_securite,
            **resultat
        }

    def optimiser_delestage(self, puissance_disponible: float, duree_max: int = 120) -> dict:
        """Optimise le délestage avec rotation"""

        quartiers = self.get_quartiers_avec_consommation()

        resultat = optimiser_delestage(quartiers, puissance_disponible, duree_max)

        return {
            "status": "success",
            "puissance_disponible": puissance_disponible,
            "duree_max_par_quartier": duree_max,
            **resultat
        }

    def get_recommandation(self, puissance_disponible: float) -> dict:
        """Donne une recommandation basée sur le délestage"""

        resultat = self.planifier_delestage(puissance_disponible)

        recommandation = ""
        if resultat["pourcentage_coupe"] > 50:
            recommandation = "⚠️ Délestage important nécessaire. Activez les générateurs de secours."
        elif resultat["pourcentage_coupe"] > 25:
            recommandation = "⚡ Délestage modéré. Réduisez la consommation non essentielle."
        elif resultat["pourcentage_coupe"] > 10:
            recommandation = "ℹ️ Délestage léger. Surveillance recommandée."
        else:
            recommandation = "✅ Réseau stable. Aucune action requise."

        return {
            "recommandation": recommandation,
            "details": resultat
        }
