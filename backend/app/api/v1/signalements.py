from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.signalement import Signalement
from app.models.coupure import Coupure
from app.api.deps import get_current_gestionnaire, get_current_user
from app.schemas.signalement import SignalementCreate, SignalementUpdate, SignalementResponse
from pydantic import BaseModel
from datetime import datetime
from app.models.quartier import Quartier

router = APIRouter(prefix="/signalements", tags=["Signalements"])


class ValidationData(BaseModel):
    id_coupure: Optional[int] = None


@router.get("/", response_model=List[SignalementResponse])
def get_all_signalements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    signalements = db.query(Signalement).offset(skip).limit(limit).all()
    return signalements


@router.get("/en-attente", response_model=List[SignalementResponse])
def get_signalements_en_attente(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    signalements = db.query(Signalement).filter(Signalement.statut == "en_attente").all()
    return signalements


@router.post("/", response_model=SignalementResponse)
def create_signalement(
    signalement: SignalementCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Crée un nouveau signalement"""
    try:
        # Créer le signalement
        nouveau_signalement = Signalement(
            id_quartier=signalement.id_quartier,
            id_citoyen=current_user.id_utilisateur,
            description=signalement.description,
            type_signalement=signalement.type_signalement,
            statut="en_attente"
        )
        db.add(nouveau_signalement)
        db.commit()
        db.refresh(nouveau_signalement)

        # Créer une notification pour le gestionnaire (sans champ 'titre')
        try:
            from app.models.notification import Notification

            quartier = db.query(Quartier).filter(Quartier.id_quartier == signalement.id_quartier).first()
            nom_quartier = quartier.nom_quartier if quartier else "un quartier"

            # Notification sans 'titre' (juste 'message')
            nouvelle_notification = Notification(
                message=f"📋 Nouveau signalement citoyen dans {nom_quartier}: {signalement.description[:100]}",
                type="signalement",
                statut="non_lu",
                id_quartier=signalement.id_quartier,
                id_signalement=nouveau_signalement.id_signalement
            )
            db.add(nouvelle_notification)
            db.commit()
        except Exception as e:
            print(f"Erreur création notification (non bloquante): {e}")
            # On continue même si la notification échoue

        return nouveau_signalement

    except Exception as e:
        print(f"❌ Erreur création signalement: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{signalement_id}/valider")
def valider_signalement(
    signalement_id: int,
    data: ValidationData = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    signalement = db.query(Signalement).filter(Signalement.id_signalement == signalement_id).first()
    if not signalement:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")

    signalement.statut = "confirme"

    nouvelle_coupure = Coupure(
        id_quartier=signalement.id_quartier,
        date_debut=datetime.now(),
        type_coupure="imprevue",
        cause=signalement.description[:200] if signalement.description else "Signalement citoyen",
        statut="en_cours"
    )

    db.add(nouvelle_coupure)
    db.commit()
    db.refresh(nouvelle_coupure)

    signalement.id_coupure = nouvelle_coupure.id_coupure
    db.commit()

    return {
        "message": "Signalement validé et coupure créée",
        "signalement_id": signalement_id,
        "coupure_id": nouvelle_coupure.id_coupure,
        "statut": signalement.statut
    }


@router.put("/{signalement_id}/rejeter")
def rejeter_signalement(
    signalement_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    signalement = db.query(Signalement).filter(Signalement.id_signalement == signalement_id).first()
    if not signalement:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")

    signalement.statut = "rejete"
    db.commit()

    return {
        "message": "Signalement rejeté",
        "signalement_id": signalement_id,
        "statut": signalement.statut
    }


@router.get("/{signalement_id}", response_model=SignalementResponse)
def get_signalement(
    signalement_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    signalement = (
        db.query(Signalement)
        .filter(Signalement.id_signalement == signalement_id)
        .first()
    )

    if not signalement:
        raise HTTPException(
            status_code=404,
            detail="Signalement non trouvé"
        )

    role = current_user.role.nom_role

    if role in ["administrateur", "gestionnaire_coupure"]:
        return signalement

    if (
        role == "citoyen"
        and signalement.id_citoyen == current_user.id_utilisateur
    ):
        return signalement

    raise HTTPException(
        status_code=403,
        detail="Vous n'êtes pas autorisé à consulter ce signalement"
    )


@router.put("/{signalement_id}", response_model=SignalementResponse)
def update_signalement(
    signalement_id: int,
    signalement_update: SignalementUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    signalement = db.query(Signalement).filter(Signalement.id_signalement == signalement_id).first()
    if not signalement:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")

    update_data = signalement_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(signalement, key, value)

    db.commit()
    db.refresh(signalement)
    return signalement
