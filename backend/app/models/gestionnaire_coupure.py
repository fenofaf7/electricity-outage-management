from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class GestionnaireCoupure(Base):
    __tablename__ = "gestionnaire_coupure"

    id_gestionnaire = Column(Integer, ForeignKey("utilisateur_administratif.id_admin_user"), primary_key=True)
    adresse = Column(String(255))
    actions = Column(String)
