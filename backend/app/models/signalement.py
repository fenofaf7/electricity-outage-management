from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class Signalement(Base):
    __tablename__ = "signalement"

    id_signalement = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    date_signalement = Column(DateTime, default=datetime.now)
    statut = Column(String(50), default="en_attente")
    type_signalement = Column(String(50))
    id_quartier = Column(Integer, ForeignKey("quartier.id_quartier"))
    id_citoyen = Column(Integer, ForeignKey("citoyen.id_citoyen"))
    id_coupure = Column(Integer, ForeignKey("coupure.id_coupure"), nullable=True)
