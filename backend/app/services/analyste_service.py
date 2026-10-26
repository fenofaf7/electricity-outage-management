from sqlalchemy.orm import Session
from app.models.analyste import Analyste
from app.services.base_service import BaseService

class AnalysteService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Analyste)

    def get_by_user_id(self, user_id: int) -> Analyste | None:
        return self.db.query(Analyste).filter(Analyste.id_analyste == user_id).first()
