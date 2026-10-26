from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    nom: str
    role: str

class RegisterRequest(BaseModel):
    nom: str
    email: EmailStr
    mot_de_passe: str
    telephone: str = None
    id_ville: int
