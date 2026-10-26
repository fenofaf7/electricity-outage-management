from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.services.utilisateur_service import UtilisateurService
from app.models.utilisateur import Utilisateur

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Utilisateur:
    """Récupère l'utilisateur actuel à partir du token JWT"""
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )

    user_service = UtilisateurService(db)
    user = user_service.get_by_id(int(user_id))

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )

    return user

async def get_current_admin(
    current_user: Utilisateur = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Utilisateur:
    """Vérifie que l'utilisateur est administrateur"""
    if current_user.role.nom_role != "administrateur":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user

async def get_current_gestionnaire(
    current_user: Utilisateur = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Utilisateur:
    """Vérifie que l'utilisateur est gestionnaire"""
    if current_user.role.nom_role not in ["administrateur", "gestionnaire_coupure"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux gestionnaires"
        )
    return current_user

async def get_current_analyste(
    current_user: Utilisateur = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Utilisateur:
    """Vérifie que l'utilisateur est analyste ou admin"""
    if current_user.role.nom_role not in ["administrateur", "analyste"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux analystes"
        )
    return current_user

async def get_current_citoyen(
    current_user: Utilisateur = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Utilisateur:
    """Vérifie que l'utilisateur est citoyen"""
    if current_user.role.nom_role != "citoyen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux citoyens"
        )
    return current_user
