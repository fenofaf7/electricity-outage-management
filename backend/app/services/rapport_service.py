from sqlalchemy.orm import Session
from datetime import datetime
from app.models.rapport import Rapport
from app.services.base_service import BaseService

class RapportService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Rapport)

    def get_by_admin(self, id_admin_user: int) -> list[Rapport]:
        return self.db.query(Rapport).filter(Rapport.id_admin_user == id_admin_user).all()

    def get_by_coupure(self, id_coupure: int) -> list[Rapport]:
        return self.db.query(Rapport).filter(Rapport.id_coupure == id_coupure).all()

    def publier_rapport(self, id_rapport: int) -> Rapport | None:
        rapport = self.get_by_id(id_rapport)
        if rapport:
            rapport.statut = "publie"
            self.db.commit()
            self.db.refresh(rapport)
        return rapport
