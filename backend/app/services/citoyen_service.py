from sqlalchemy.orm import Session
from app.models.citoyen import Citoyen
from app.models.utilisateur import Utilisateur
from app.services.base_service import BaseService

class CitoyenService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Citoyen)

    def get_by_user_id(self, user_id: int) -> Citoyen | None:
        return self.db.query(Citoyen).filter(Citoyen.id_citoyen == user_id).first()

    def get_citoyen_with_user(self, citoyen_id: int):
        return self.db.query(Citoyen, Utilisateur).join(
            Utilisateur, Citoyen.id_citoyen == Utilisateur.id_utilisateur
        ).filter(Citoyen.id_citoyen == citoyen_id).first()
