from sqlalchemy.orm import Session
from datetime import datetime
from app.models.consommation import Consommation
from app.services.base_service import BaseService

class ConsommationService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Consommation)

    def get_by_quartier(self, id_quartier: int, debut: datetime = None, fin: datetime = None) -> list[Consommation]:
        query = self.db.query(Consommation).filter(Consommation.id_quartier == id_quartier)
        if debut:
            query = query.filter(Consommation.date_heure >= debut)
        if fin:
            query = query.filter(Consommation.date_heure <= fin)
        return query.all()

    def get_moyenne_par_heure(self, id_quartier: int, date: datetime) -> float:
        result = self.db.query(Consommation).filter(
            Consommation.id_quartier == id_quartier,
            Consommation.date_heure >= date,
            Consommation.date_heure < date.replace(hour=23, minute=59)
        ).all()

        if not result:
            return 0
        return sum(c.valeur for c in result) / len(result)
