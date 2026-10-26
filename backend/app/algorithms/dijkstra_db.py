"""
Intégration de l'algorithme de Dijkstra avec la base de données
Ce fichier utilise ton algorithme existant et les données de ta base
"""

from sqlalchemy.orm import Session
from app.algorithms.dijkstra import dijkstra, optimiser_distribution, trouver_chemins_alternatifs
from app.models.quartier import Quartier

class ReseauElectriqueDB:
    """Version avec base de données"""

    def __init__(self, db: Session):
        self.db = db
        self.noms_quartiers = self._charger_noms_quartiers()
        self.graph = self._construire_graphe_depuis_db()

    def _charger_noms_quartiers(self) -> dict:
        """Charge les noms des quartiers depuis la base"""
        quartiers = self.db.query(Quartier).all()
        return {q.id_quartier: q.nom_quartier for q in quartiers}

    def _construire_graphe_depuis_db(self) -> dict:
        """Construit le graphe à partir des quartiers de ta base"""

        quartiers_ids = list(self.noms_quartiers.keys())

        # Structure du réseau (à améliorer avec une vraie table de liaisons)
        # Pour l'instant, connexions basées sur l'ordre des ID
        graphe = {}

        for qid in quartiers_ids:
            graphe[qid] = []

        # Créer des connexions entre quartiers proches
        sorted_ids = sorted(quartiers_ids)
        for i, qid in enumerate(sorted_ids):
            if i < len(sorted_ids) - 1:
                # Connexion au suivant
                graphe[qid].append((sorted_ids[i + 1], 1.5))
            if i > 0:
                # Connexion au précédent
                graphe[qid].append((sorted_ids[i - 1], 1.5))

        return graphe

    def get_nom_quartier(self, id_quartier: int) -> str:
        """Retourne le nom du quartier"""
        return self.noms_quartiers.get(id_quartier, f"Quartier {id_quartier}")

    def chemin_optimal(self, source: int, destination: int) -> dict:
        """Trouve le chemin optimal entre deux quartiers"""

        if source not in self.graph or destination not in self.graph:
            return {"error": f"Quartier non trouvé", "success": False}

        # Utilise TON algorithme dijkstra
        chemin_ids, distance = dijkstra(self.graph, source, destination)

        if not chemin_ids:
            return {"error": "Aucun chemin trouvé", "success": False}

        chemin_noms = [self.get_nom_quartier(qid) for qid in chemin_ids]

        return {
            "success": True,
            "source": source,
            "destination": destination,
            "source_nom": self.get_nom_quartier(source),
            "destination_nom": self.get_nom_quartier(destination),
            "chemin_ids": chemin_ids,
            "chemin_noms": chemin_noms,
            "distance": round(distance, 2),
            "nb_etapes": len(chemin_ids) - 1
        }
