from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Coupure(Base):
    __tablename__ = "coupure"

    id_coupure = Column(Integer, primary_key=True, index=True)
    date_debut = Column(DateTime, nullable=False)
    date_fin = Column(DateTime, nullable=True)
    duree_minutes = Column(Integer)
    type_coupure = Column(String(50))
    cause = Column(String)
    statut = Column(String(50), default="en_cours")
    id_quartier = Column(Integer, ForeignKey("quartier.id_quartier"))

    quartier = relationship("Quartier")
