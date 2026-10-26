from sqlalchemy.orm import Session
from app.models.utilisateur import Utilisateur
from app.services.base_service import BaseService

class UtilisateurService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Utilisateur)

    def get_by_email(self, email: str) -> Utilisateur | None:
        return self.db.query(Utilisateur).filter(Utilisateur.email == email).first()

    def get_by_id(self, user_id: int) -> Utilisateur | None:
        return self.db.query(Utilisateur).filter(Utilisateur.id_utilisateur == user_id).first()  # ← Vérifie "id_utilisateur"
