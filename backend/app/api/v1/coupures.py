from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.coupure import CoupureCreate, CoupureUpdate, CoupureResponse
from app.services.coupure_service import CoupureService
from app.api.deps import get_current_gestionnaire
from app.models.coupure import Coupure

class ResoudreData(BaseModel):
    statut: str = "termine"
    date_fin: Optional[datetime] = None

router = APIRouter(prefix="/coupures", tags=["Coupures"])

@router.get("/", response_model=List[CoupureResponse])
def get_all_coupures(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Récupère toutes les coupures"""
    service = CoupureService(db)
    return service.get_all(skip=skip, limit=limit)

@router.get("/{coupure_id}", response_model=CoupureResponse)
def get_coupure(
    coupure_id: int,
    db: Session = Depends(get_db)
):
    """Récupère une coupure par son ID"""
    service = CoupureService(db)
    coupure = service.get_by_id(coupure_id)
    if not coupure:
        raise HTTPException(status_code=404, detail="Coupure non trouvée")
    return coupure

@router.post("/", response_model=CoupureResponse, status_code=status.HTTP_201_CREATED)
def create_coupure(
    data: CoupureCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    """Crée une nouvelle coupure (réservé aux gestionnaires)"""
    service = CoupureService(db)
    return service.creer_coupure(data.dict())

@router.put("/{coupure_id}", response_model=CoupureResponse)
def update_coupure(
    coupure_id: int,
    data: CoupureUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    """Met à jour une coupure (réservé aux gestionnaires)"""
    service = CoupureService(db)
    coupure = service.update(coupure_id, data.dict(exclude_unset=True))
    if not coupure:
        raise HTTPException(status_code=404, detail="Coupure non trouvée")
    return coupure

@router.delete("/{coupure_id}")
def delete_coupure(
    coupure_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    """Supprime une coupure (réservé aux gestionnaires)"""
    service = CoupureService(db)
    deleted = service.delete(coupure_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Coupure non trouvée")
    return {"message": "Coupure supprimée avec succès"}

@router.get("/en-cours/", response_model=List[CoupureResponse])
def get_coupures_en_cours(db: Session = Depends(get_db)):
    """Récupère toutes les coupures en cours"""
    service = CoupureService(db)
    return service.get_coupures_en_cours()


@router.put("/{coupure_id}/resoudre")
def resoudre_coupure(
    coupure_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_gestionnaire)
):
    """Marque une coupure comme résolue (gestionnaire uniquement)"""

    print(f"🔧 Tentative de résolution de la coupure {coupure_id}")

    # Récupérer la coupure
    coupure = db.query(Coupure).filter(Coupure.id_coupure == coupure_id).first()
    if not coupure:
        print(f"❌ Coupure {coupure_id} non trouvée")
        raise HTTPException(status_code=404, detail="Coupure non trouvée")

    print(f"✅ Coupure trouvée: {coupure.id_coupure}, statut actuel: {coupure.statut}")

    # Mettre à jour
    coupure.statut = "termine"
    coupure.date_fin = datetime.now()

    # Calculer la durée si possible
    if coupure.date_debut:
        duree = (coupure.date_fin - coupure.date_debut).total_seconds() / 60
        # Utiliser le bon nom de colonne
        if hasattr(coupure, 'duree_minutes'):
            coupure.duree_minutes = int(duree)
        elif hasattr(coupure, 'duree_minute'):
            coupure.duree_minute = int(duree)

    db.commit()

    print(f"✅ Coupure {coupure_id} résolue, nouveau statut: {coupure.statut}")

    return {
        "message": "Coupure résolue avec succès",
        "id_coupure": coupure_id,
        "statut": coupure.statut,
        "date_fin": coupure.date_fin
    }
