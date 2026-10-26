from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base

class HistoriqueCoupure(Base):
    __tablename__ = "historique_coupure"

    id_historique = Column(Integer, primary_key=True, index=True)
    date_debut = Column(DateTime, nullable=False)
    date_fin = Column(DateTime, nullable=True)
    duree_minutes = Column(Integer)
    frequence = Column(Integer)
    commentaire = Column(String)
    id_coupure = Column(Integer, ForeignKey("coupure.id_coupure"))
