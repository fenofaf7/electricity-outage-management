from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.services.auth_service import AuthService
from app.services.utilisateur_service import UtilisateurService
from app.models.utilisateur import Utilisateur

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Connexion utilisateur"""
    auth_service = AuthService(db)
    user = auth_service.authenticate(data.email, data.mot_de_passe)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    token = auth_service.create_token(user)

    return LoginResponse(
        access_token=token,
        user_id=user.id_utilisateur,
        nom=user.nom,
        role=user.role.nom_role
    )

@router.post("/register", response_model=LoginResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Inscription nouvel utilisateur"""
    # Vérifier si l'email existe déjà
    utilisateur_service = UtilisateurService(db)
    existing_user = utilisateur_service.get_by_email(data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )

    auth_service = AuthService(db)
    user = auth_service.register(
        nom=data.nom,
        email=data.email,
        password=data.mot_de_passe,
        telephone=data.telephone,
        id_ville=data.id_ville
    )

    token = auth_service.create_token(user)

    return LoginResponse(
        access_token=token,
        user_id=user.id_utilisateur,
        nom=user.nom,
        role=user.role.nom_role
    )
