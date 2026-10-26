# test_db.py
import psycopg2
import os

try:
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database="plateforme_coupures",
        user="postgres",
        password=os.environ["POSTGRES_PASSWORD"]
    )
    print("✅ Connexion réussie à PostgreSQL !")
    conn.close()
except Exception as e:
    print(f"❌ Erreur de connexion : {e}")
