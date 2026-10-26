from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notification"

    id_notification = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    date_envoi = Column(DateTime, server_default=func.now())
    type = Column(String(50), default="info")
    statut = Column(String(50), default="non_lu")
    id_citoyen = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), nullable=True)
    id_coupure = Column(Integer, ForeignKey("coupure.id_coupure"), nullable=True)
    id_service = Column(Integer, ForeignKey("service_externe.id_service"), nullable=True)
    id_signalement = Column(Integer, ForeignKey("signalement.id_signalement"), nullable=True)
