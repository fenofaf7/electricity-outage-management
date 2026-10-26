from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.notification import Notification
from app.api.deps import get_current_gestionnaire, get_current_user
from pydantic import BaseModel
from datetime import datetime
import traceback

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationCreate(BaseModel):
    message: str
    type: str = "info"
    id_citoyen: Optional[int] = None
    id_coupure: Optional[int] = None
    id_service: Optional[int] = None
    id_signalement: Optional[int] = None


class NotificationResponse(BaseModel):
    id_notification: int
    message: str
    date_envoi: datetime
    type: str
    statut: str
    id_citoyen: Optional[int]
    id_coupure: Optional[int]
    id_service: Optional[int]
    id_signalement: Optional[int]


@router.get("/", response_model=List[NotificationResponse])
def get_all_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Récupère toutes les notifications"""
    try:
        print("🔍 Tentative de récupération des notifications...")
        notifications = db.query(Notification).offset(skip).limit(limit).all()
        print(f"✅ {len(notifications)} notifications récupérées")
        return notifications
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mes-notifications")
def get_mes_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        notifications = db.query(Notification).filter(
            Notification.id_citoyen == current_user.id_utilisateur
        ).order_by(Notification.date_envoi.desc()).all()
        return notifications
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    try:
        print(f"🔍 Création notification: {notification.message[:50]}...")

        nouvelle_notification = Notification(
            message=notification.message,
            type=notification.type,
            statut="non_lu",
            id_citoyen=notification.id_citoyen,
            id_coupure=notification.id_coupure,
            id_service=notification.id_service,
            id_signalement=notification.id_signalement
        )
        db.add(nouvelle_notification)
        db.commit()
        db.refresh(nouvelle_notification)

        print(f"✅ Notification créée avec id {nouvelle_notification.id_notification}")
        return nouvelle_notification
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{notification_id}/lire")
def marquer_comme_lue(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        notification = db.query(Notification).filter(
            Notification.id_notification == notification_id
        ).first()

        if not notification:
            raise HTTPException(status_code=404, detail="Notification non trouvée")

        notification.statut = "lu"
        db.commit()

        return {"message": "Notification marquée comme lue"}
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
