from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.log import Log
from app.models.utilisateur import Utilisateur
from app.api.deps import get_current_admin
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/logs", tags=["Logs"])

class LogResponse(BaseModel):
    id_log: int
    utilisateur_nom: Optional[str]
    utilisateur_email: Optional[str]
    action: str
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

@router.get("/", response_model=List[LogResponse])
def get_all_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """Récupère tous les logs (admin uniquement)"""
    query = db.query(Log)

    if action:
        query = query.filter(Log.action == action)

    logs = query.order_by(Log.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for log in logs:
        utilisateur_nom = None
        utilisateur_email = None
        if log.id_utilisateur:
            user = db.query(Utilisateur).filter(Utilisateur.id_utilisateur == log.id_utilisateur).first()
            if user:
                utilisateur_nom = user.nom
                utilisateur_email = user.email

        result.append(LogResponse(
            id_log=log.id_log,
            utilisateur_nom=utilisateur_nom,
            utilisateur_email=utilisateur_email,
            action=log.action,
            details=log.details,
            ip_address=log.ip_address,
            created_at=log.created_at
        ))

    return result
