from sqlalchemy.orm import Session
from app.models.gestionnaire_coupure import GestionnaireCoupure
from app.services.base_service import BaseService

class GestionnaireService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, GestionnaireCoupure)

    def get_by_user_id(self, user_id: int) -> GestionnaireCoupure | None:
        return self.db.query(GestionnaireCoupure).filter(GestionnaireCoupure.id_gestionnaire == user_id).first()
