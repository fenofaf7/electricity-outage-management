from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Role(Base):
    __tablename__ = "role"

    id_role = Column(Integer, primary_key=True, index=True)
    nom_role = Column(String(50), unique=True, nullable=False)
