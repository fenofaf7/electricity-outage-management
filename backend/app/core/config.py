import os
from pathlib import Path

# Charge le fichier .env manuellement
env_path = Path(__file__).parent.parent / ".env"

if env_path.exists():
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, value = line.split("=", 1)
                os.environ[key] = value

class Settings:
    # Base de données
    DATABASE_URL: str = os.environ["DATABASE_URL"]

    # Sécurité
    SECRET_KEY: str = os.environ["SECRET_KEY"]
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application
    DEBUG: bool = True

settings = Settings()