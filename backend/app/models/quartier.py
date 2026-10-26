from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.core.database import Base

class Quartier(Base):
    __tablename__ = "quartier"

    id_quartier = Column(Integer, primary_key=True, index=True)
    nom_quartier = Column(String(100), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    statut = Column(String(50), default="actif")
    id_ville = Column(Integer, ForeignKey("ville.id_ville"))
