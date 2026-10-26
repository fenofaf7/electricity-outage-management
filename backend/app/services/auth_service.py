from sqlalchemy.orm import Session
from app.models.utilisateur import Utilisateur
from app.models.role import Role
from app.core.security import verify_password, get_password_hash, create_access_token

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def authenticate(self, email: str, password: str) -> Utilisateur | None:
        user = self.db.query(Utilisateur).filter(Utilisateur.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.mot_de_passe):
            return None
        return user

    def create_token(self, user: Utilisateur) -> str:
        return create_access_token(data={"sub": str(user.id_utilisateur)})

    def register(self, nom: str, email: str, password: str, telephone: str, id_ville: int) -> Utilisateur:
        # Récupérer le rôle citoyen (id_role = 1)
        role_citoyen = self.db.query(Role).filter(Role.nom_role == "citoyen").first()

        user = Utilisateur(
            nom=nom,
            email=email,
            mot_de_passe=get_password_hash(password),
            telephone=telephone,
            id_role=role_citoyen.id_role,
            id_ville=id_ville
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
