from sqlalchemy.orm import Session
from datetime import datetime
from app.models.prediction import Prediction
from app.services.base_service import BaseService

class PredictionService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Prediction)

    def get_predictions_by_quartier(self, id_quartier: int) -> list[Prediction]:
        return self.db.query(Prediction).filter(Prediction.id_quartier == id_quartier).all()
