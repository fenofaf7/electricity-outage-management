from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class UtilisateurAdministratif(Base):
    __tablename__ = "utilisateur_administratif"

    id_admin_user = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), primary_key=True)
