from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.services.base_service import BaseService
from sqlalchemy.orm import Session

class NotificationService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Notification)

    def get_notifications_by_citoyen(self, id_citoyen: int) -> list[Notification]:
        return self.db.query(Notification).filter(Notification.id_citoyen == id_citoyen).all()
from datetime import datetime
from app.models.notification import Notification
from app.services.base_service import BaseService

class NotificationService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Notification)

    def get_by_citoyen(self, id_citoyen: int, non_lues_seulement: bool = False) -> list[Notification]:
        query = self.db.query(Notification).filter(Notification.id_citoyen == id_citoyen)
        if non_lues_seulement:
            query = query.filter(Notification.statut == "envoye")
        return query.order_by(Notification.date_envoi.desc()).all()

    def marquer_comme_lue(self, id_notification: int) -> Notification | None:
        notif = self.get_by_id(id_notification)
        if notif:
            notif.statut = "lu"
            self.db.commit()
            self.db.refresh(notif)
        return notif

    def envoyer_notification(self, id_citoyen: int, message: str, type_notif: str = "info", id_coupure: int = None) -> Notification:
        return self.create({
            "id_citoyen": id_citoyen,
            "message": message,
            "type": type_notif,
            "date_envoi": datetime.now(),
            "statut": "envoye",
            "id_coupure": id_coupure
        })
