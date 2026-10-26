from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import (
    auth, utilisateurs, citoyens, administrateurs, gestionnaires, analystes,
    coupures, signalements, quartiers, consommations, historiques,
    predictions, notifications, rapports, statistiques, dashboard, reseau, logs
)
from app.core.config import settings
from app.middlewares.logging_middleware import LoggingMiddleware
from app.middlewares.rate_limit_middleware import RateLimitMiddleware
from app.middlewares.error_handler import ErrorHandlerMiddleware
from app.api.v1 import test
from app.api.v1 import optimisation

app = FastAPI(
    title="Plateforme Gestion Coupures",
    description="Plateforme de gestion et prédiction des coupures électriques à Madagascar",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================
# CORS - Configuration complète (À METTRE TOUT EN HAUT)
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[""
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(utilisateurs.router, prefix="/api/v1")
app.include_router(citoyens.router, prefix="/api/v1")
app.include_router(administrateurs.router, prefix="/api/v1")
app.include_router(gestionnaires.router, prefix="/api/v1")
app.include_router(analystes.router, prefix="/api/v1")
app.include_router(coupures.router, prefix="/api/v1")
app.include_router(signalements.router, prefix="/api/v1")
app.include_router(quartiers.router, prefix="/api/v1")
app.include_router(consommations.router, prefix="/api/v1")
app.include_router(historiques.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(rapports.router, prefix="/api/v1")
app.include_router(statistiques.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)
app.add_middleware(ErrorHandlerMiddleware)
app.include_router(logs.router, prefix="/api/v1")
app.include_router(optimisation.router, prefix="/api/v1")
app.include_router(reseau.router, prefix="/api/v1")
app.include_router(test.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Bienvenue sur l'API Plateforme Gestion des Coupures",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
