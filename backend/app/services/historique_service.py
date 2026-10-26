from sqlalchemy.orm import Session
from datetime import datetime
from app.models.historique_coupure import HistoriqueCoupure
from app.services.base_service import BaseService

class HistoriqueService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, HistoriqueCoupure)

    def get_by_coupure(self, id_coupure: int) -> list[HistoriqueCoupure]:
        return self.db.query(HistoriqueCoupure).filter(HistoriqueCoupure.id_coupure == id_coupure).all()

    def get_frequence_par_mois(self, annee: int = None) -> list[dict]:
        query = self.db.query(HistoriqueCoupure)
        if annee:
            query = query.filter(func.extract('year', HistoriqueCoupure.date_debut) == annee)

        result = query.all()
        return {"total": len(result), "duree_totale": sum(h.duree_minutes or 0 for h in result)}
