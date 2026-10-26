from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Administrateur(Base):
    __tablename__ = "administrateur"

    id_administrateur = Column(Integer, ForeignKey("utilisateur_administratif.id_admin_user"), primary_key=True)
    niveau_acces = Column(String(50))
    permissions = Column(String)
