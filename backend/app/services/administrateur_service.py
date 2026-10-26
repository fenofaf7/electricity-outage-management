from sqlalchemy.orm import Session
from app.models.administrateur import Administrateur
from app.services.base_service import BaseService

class AdministrateurService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Administrateur)

    def get_by_user_id(self, user_id: int) -> Administrateur | None:
        return self.db.query(Administrateur).filter(Administrateur.id_administrateur == user_id).first()
