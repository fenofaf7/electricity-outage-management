from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Rapport(Base):
    __tablename__ = "rapport"

    id_rapport = Column(Integer, primary_key=True, index=True)
    titre = Column(String(200), nullable=False)
    contenu = Column(Text, nullable=True)
    date_creation = Column(DateTime, server_default=func.now())
    type_rapport = Column(String(50), nullable=True)
    statut = Column(String(50), default="brouillon")
    id_admin_user = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), nullable=True)
    id_coupure = Column(Integer, ForeignKey("coupure.id_coupure"), nullable=True)
