from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    message: str
    type: Optional[str] = None
    statut: str = "envoye"
    id_citoyen: int

class NotificationCreate(NotificationBase):
    id_coupure: Optional[int] = None
    id_service: Optional[int] = None

class NotificationResponse(NotificationBase):
    id_notification: int
    date_envoi: datetime
    id_coupure: Optional[int] = None

    class Config:
        from_attributes = True
