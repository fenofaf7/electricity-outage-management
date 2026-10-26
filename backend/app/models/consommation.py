from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from app.core.database import Base

class Consommation(Base):
    __tablename__ = "consommation"

    id_consommation = Column(Integer, primary_key=True, index=True)
    date_heure = Column(DateTime, nullable=False)
    valeur = Column(Float, nullable=False)
    unite = Column(String(20))
    source = Column(String(100))
    id_quartier = Column(Integer, ForeignKey("quartier.id_quartier"))
    id_coupure = Column(Integer, ForeignKey("coupure.id_coupure"), nullable=True)
