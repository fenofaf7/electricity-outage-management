from sqlalchemy import Column, Integer, String
from app.core.database import Base

class ServiceExterne(Base):
    __tablename__ = "service_externe"

    id_service = Column(Integer, primary_key=True, index=True)
    nom_service = Column(String(100), nullable=False)
    type_service = Column(String(50))
    endpoint = Column(String(255))
