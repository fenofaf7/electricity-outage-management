from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Citoyen(Base):
    __tablename__ = "citoyen"

    id_citoyen = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), primary_key=True)
    adresse = Column(String)
    id_quartier_pref = Column(Integer, ForeignKey("quartier.id_quartier"), nullable=True)
