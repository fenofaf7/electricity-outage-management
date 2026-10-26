from sqlalchemy.orm import Session
from app.models.signalement import Signalement
from app.services.base_service import BaseService
from datetime import datetime
import traceback

class SignalementService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db, Signalement)

    def creer_signalement(self, data: dict) -> Signalement:
        print("=== SERVICE: création signalement ===")
        print("Data reçue:", data)

        try:
            # Vérifier les champs obligatoires
            if not data.get("id_quartier"):
                raise ValueError("id_quartier est requis")
            if not data.get("id_citoyen"):
                raise ValueError("id_citoyen est requis")

            # Créer le signalement avec date automatique
            signalement = Signalement(
                description=data.get("description"),
                type_signalement=data.get("type_signalement", "panne"),
                statut="en_attente",
                date_signalement=datetime.now(),  # ← Ajoute la date ici
                id_quartier=data.get("id_quartier"),
                id_citoyen=data.get("id_citoyen")
            )

            self.db.add(signalement)
            self.db.commit()
            self.db.refresh(signalement)

            print("Signalement créé avec ID:", signalement.id_signalement)
            return signalement

        except Exception as e:
            print(f"ERREUR: {e}")
            traceback.print_exc()
            self.db.rollback()
            raise e
