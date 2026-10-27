from dotenv import load_dotenv
from types import SimpleNamespace
from app.api.deps import get_current_user
from unittest.mock import MagicMock
from app.core.database import get_db

load_dotenv(".env")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_home():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "message" in data
    assert "version" in data


def test_openapi():
    response = client.get("/openapi.json")

    assert response.status_code == 200

    data = response.json()

    assert "openapi" in data
    assert "paths" in data
    assert "/api/v1/auth/login" in data["paths"]


def test_admin_without_token():
    response = client.get("/api/v1/administrateurs/")

    assert response.status_code in (401, 403)


def test_admin_with_invalid_token():
    response = client.get(
        "/api/v1/administrateurs/",
        headers={
            "Authorization": "Bearer invalid-token-test"
        }
    )

    assert response.status_code == 401


def test_citoyen_cannot_create_coupure():
    fake_citoyen = SimpleNamespace(
        id_utilisateur=999,
        statut="actif",
        role=SimpleNamespace(nom_role="citoyen")
    )

    app.dependency_overrides[get_current_user] = (
        lambda: fake_citoyen
    )

    try:
        response = client.post(
            "/api/v1/coupures/",
            json={}
        )

        assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_user, None)

def test_citoyen_cannot_publish_rapport():
    fake_citoyen = SimpleNamespace(
        id_utilisateur=999,
        statut="actif",
        role=SimpleNamespace(nom_role="citoyen")
    )

    app.dependency_overrides[get_current_user] = (
        lambda: fake_citoyen
    )

    try:
        response = client.put(
            "/api/v1/rapports/1/publier"
        )

        assert response.status_code == 403

    finally:
        app.dependency_overrides.pop(get_current_user, None)

def test_citoyen_cannot_read_other_signalement():
    fake_citoyen = SimpleNamespace(
        id_utilisateur=1,
        statut="actif",
        role=SimpleNamespace(nom_role="citoyen")
    )

    fake_signalement = SimpleNamespace(
        id_signalement=15,
        id_citoyen=2
    )

    fake_db = MagicMock()
    fake_db.query.return_value.filter.return_value.first.return_value = (
        fake_signalement
    )

    app.dependency_overrides[get_current_user] = lambda: fake_citoyen
    app.dependency_overrides[get_db] = lambda: fake_db

    try:
        response = client.get("/api/v1/signalements/15")
        assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)