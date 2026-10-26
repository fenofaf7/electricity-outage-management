#!/usr/bin/env python
# scripts/seed_users.py
# Crée les utilisateurs de test via l'API (pas de hash à générer manuellement)

import requests
import os
import time

API_BASE_URL = "http://localhost:8000/api/v1"

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / "backend" / ".env")

def create_user(email, nom, telephone, mot_de_passe, id_ville=1):
    """Crée un utilisateur via l'API d'inscription"""
    url = f"{API_BASE_URL}/auth/register"
    data = {
        "email": email,
        "nom": nom,
        "mot_de_passe": mot_de_passe,
        "telephone": telephone,
        "id_ville": id_ville
    }

    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"✅ Utilisateur créé : {email} (mot de passe: {mot_de_passe})")
            return response.json()
        else:
            print(f"⚠️  {email} : {response.json().get('detail', 'Erreur inconnue')}")
            return None
    except Exception as e:
        print(f"❌ Erreur pour {email}: {e}")
        return None

def main():
    print("=" * 60)
    print("📝 Création des utilisateurs de test")
    print("=" * 60)
    print()

    # Attendre que l'API soit prête
    print("⏳ Vérification de l'API...")
    try:
        requests.get("http://localhost:8000/health")
        print("✅ API disponible")
    except:
        print("❌ API non disponible ! Lance d'abord : uvicorn app.main:app --reload")
        return

    print()
    print("🚀 Création des utilisateurs...")
    print("-" * 40)

    # Liste des utilisateurs à créer
    users = [
        # Administrateur
        {
            "email": "admin@example.com",
            "nom": "Admin System",
            "telephone": "0340000001",
            "mot_de_passe": os.environ["DEMO_ADMIN_PASSWORD"],
            "id_ville": 1
        },
        # Gestionnaire
        {
            "email": "gestionnaire@example.com",
            "nom": "Gestionnaire Coupure",
            "telephone": "0340000002",
            "mot_de_passe": os.environ["DEMO_GESTIONNAIRE_PASSWORD"],
            "id_ville": 1
        },
        # Analyste
        {
            "email": "analyste@example.com",
            "nom": "Analyste Data",
            "telephone": "0340000003",
            "mot_de_passe": os.environ["DEMO_ANALYSTE_PASSWORD"],
            "id_ville": 1
        },
        # Citoyens
        {
            "email": "rakoto@example.com",
            "nom": "Feno Andria",
            "telephone": "0340000010",
            "mot_de_passe": os.environ["DEMO_CITOYEN_PASSWORD"],
            "id_ville": 1
        },
        {
            "email": "jean@example.com",
            "nom": "Jean Paul",
            "telephone": "0340000011",
            "mot_de_passe": os.environ["DEMO_CITOYEN_PASSWORD"],
            "id_ville": 1
        },
        {
            "email": "andrianary@example.com",
            "nom": "Andrianary Marie",
            "telephone": "0340000012",
            "mot_de_passe": os.environ["DEMO_CITOYEN_PASSWORD"],
            "id_ville": 5  # Toamasina
        },
        {
            "email": "rasolo@example.com",
            "nom": "Rasolofonirina Solo",
            "telephone": "0340000013",
            "mot_de_passe": os.environ["DEMO_CITOYEN_PASSWORD"],
            "id_ville": 4  # Mahajanga
        }
    ]

    # Créer chaque utilisateur
    for user in users:
        create_user(**user)
        time.sleep(0.5)  # Pause pour éviter de surcharger l'API
if __name__ == "__main__":
    main()
