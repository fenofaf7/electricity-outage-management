from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_utilisateur = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    mot_de_passe = Column(String(255), nullable=False)
    telephone = Column(String(20))
    date_creation = Column(DateTime, default=datetime.now)
    statut = Column(String(50), default="actif")
    id_role = Column(Integer, ForeignKey("role.id_role"))
    id_ville = Column(Integer, ForeignKey("ville.id_ville"))

    # Relations
    role = relationship("Role")
    ville = relationship("Ville")
