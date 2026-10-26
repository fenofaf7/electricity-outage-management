from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Ville(Base):
    __tablename__ = "ville"

    id_ville = Column(Integer, primary_key=True, index=True)
    nom_ville = Column(String(100), nullable=False)
