from sqlalchemy.orm import Session
from datetime import datetime
from app.models.coupure import Coupure
from app.models.historique_coupure import HistoriqueCoupure
from app.services.base_service import BaseService

class CoupureService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Coupure)

    def creer_coupure(self, data: dict) -> Coupure:
        # Calculer la durée si date_fin est fournie
        if data.get("date_fin") and data.get("date_debut"):
            duree = (data["date_fin"] - data["date_debut"]).total_seconds() / 60
            data["duree_minutes"] = int(duree)

        return self.create(data)

    def terminer_coupure(self, id_coupure: int, date_fin: datetime) -> Coupure | None:
        coupure = self.get_by_id(id_coupure)
        if coupure:
            coupure.date_fin = date_fin
            # Calculer la durée
            duree = (date_fin - coupure.date_debut).total_seconds() / 60
            coupure.duree_minutes = int(duree)
            coupure.statut = "termine"
            self.db.commit()
            self.db.refresh(coupure)

            # Archiver dans historique
            historique = HistoriqueCoupure(
                date_debut=coupure.date_debut,
                date_fin=date_fin,
                duree_minutes=coupure.duree_minutes,
                id_coupure=id_coupure
            )
            self.db.add(historique)
            self.db.commit()

        return coupure

    def get_coupures_en_cours(self) -> list[Coupure]:
        return self.db.query(Coupure).filter(Coupure.statut == "en_cours").all()

    def get_coupures_by_quartier(self, id_quartier: int) -> list[Coupure]:
        return self.db.query(Coupure).filter(Coupure.id_quartier == id_quartier).all()
