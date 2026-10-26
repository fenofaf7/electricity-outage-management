from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Analyste(Base):
    __tablename__ = "analyste"

    id_analyste = Column(Integer, ForeignKey("utilisateur_administratif.id_admin_user"), primary_key=True)
    adresse = Column(String(255))
    actions = Column(String)
