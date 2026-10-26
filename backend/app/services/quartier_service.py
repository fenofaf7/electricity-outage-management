from sqlalchemy.orm import Session
from app.models.quartier import Quartier
from app.models.coupure import Coupure
from app.services.base_service import BaseService

class QuartierService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Quartier)

    def get_quartiers_by_ville(self, id_ville: int) -> list[Quartier]:
        return self.db.query(Quartier).filter(Quartier.id_ville == id_ville).all()

    def get_quartier_with_stats(self, id_quartier: int):
        quartier = self.get_by_id(id_quartier)
        if not quartier:
            return None

        # Compter les coupures
        nb_coupures = self.db.query(Coupure).filter(Coupure.id_quartier == id_quartier).count()

        return {
            "id_quartier": quartier.id_quartier,
            "nom_quartier": quartier.nom_quartier,
            "nb_coupures": nb_coupures
        }
