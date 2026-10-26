from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "prediction"

    id_prediction = Column(Integer, primary_key=True, index=True)
    id_quartier = Column(Integer, ForeignKey("quartier.id_quartier"), nullable=False)
    probabilite = Column(Float, nullable=False)
    niveau_risque = Column(String(20), nullable=False)
    date_prediction = Column(DateTime, server_default=func.now())
    horizon = Column(String(10), default="24h")
    recommandation = Column(String(500), nullable=True)
