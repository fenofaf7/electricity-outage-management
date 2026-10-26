from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.coupure import Coupure
from app.models.signalement import Signalement
from app.models.quartier import Quartier
from app.models.prediction import Prediction

def calculer_risque_coupure(
    db: Session,
    id_quartier: int,
    jours_historique: int = 30,
    alpha: float = 0.15
) -> dict:
    """
    Calcule le risque de coupure pour un quartier
    Formule: P = ( (Σ Ei / D) × W_récence ) + (α × I_P)

    Paramètres:
    - id_quartier: ID du quartier
    - jours_historique: Nombre de jours d'historique (défaut: 30)
    - alpha: Coefficient de pondération des signalements (défaut: 0.15)
    """

    date_fin = datetime.now()
    date_debut = date_fin - timedelta(days=jours_historique)

    # 1. Calcul de la fréquence historique Σ Ei / D
    nb_coupures = db.query(Coupure).filter(
        Coupure.id_quartier == id_quartier,
        Coupure.date_debut >= date_debut,
        Coupure.date_debut <= date_fin
    ).count()

    frequence = nb_coupures / jours_historique

    # 2. Calcul du poids de récence W_récence
    # Poids plus élevé si coupure récente (dernières 24h)
    coupure_recente = db.query(Coupure).filter(
        Coupure.id_quartier == id_quartier,
        Coupure.date_debut >= date_fin - timedelta(days=1),
        Coupure.statut == 'en_cours'
    ).first()

    if coupure_recente:
        w_recence = 1.3  # Coupure en cours = risque très élevé
    else:
        # Vérifier s'il y a eu une coupure dans les 3 derniers jours
        coupure_3j = db.query(Coupure).filter(
            Coupure.id_quartier == id_quartier,
            Coupure.date_debut >= date_fin - timedelta(days=3)
        ).first()
        if coupure_3j:
            w_recence = 1.15
        else:
            w_recence = 1.0

    # 3. Calcul de l'indice participatif I_P (basé sur les signalements)
    signalements_recents = db.query(Signalement).filter(
        Signalement.id_quartier == id_quartier,
        Signalement.date_signalement >= date_fin - timedelta(days=7)
    ).count()

    # Normalisation: 10 signalements = indice 1, max 1
    ip = min(signalements_recents / 10, 1.0)

    # 4. Application de la formule
    probabilite = (frequence * w_recence) + (alpha * ip)

    # Limiter entre 0 et 1
    probabilite = min(max(probabilite, 0), 1)

    # Convertir en pourcentage (0-100)
    probabilite_pct = round(probabilite * 100, 1)

    # Déterminer le niveau de risque
    if probabilite_pct >= 70:
        niveau_risque = "critique"
    elif probabilite_pct >= 50:
        niveau_risque = "eleve"
    elif probabilite_pct >= 25:
        niveau_risque = "moyen"
    elif probabilite_pct >= 10:
        niveau_risque = "faible"
    else:
        niveau_risque = "tres_faible"

    return {
        "id_quartier": id_quartier,
        "probabilite": probabilite_pct,
        "niveau_risque": niveau_risque,
        "details": {
            "frequence_historique": round(frequence * 100, 1),
            "nb_coupures": nb_coupures,
            "w_recence": w_recence,
            "indice_participatif": round(ip * 100, 1),
            "signalements_recents": signalements_recents,
            "jours_historique": jours_historique
        }
    }


def calculer_risques_tous_quartiers(
    db: Session,
    jours_historique: int = 30,
    alpha: float = 0.15
) -> list:
    """Calcule le risque pour tous les quartiers et retourne trié"""

    quartiers = db.query(Quartier).all()
    resultats = []

    for quartier in quartiers:
        risque = calculer_risque_coupure(db, quartier.id_quartier, jours_historique, alpha)
        resultats.append(risque)

    # Trier par probabilité décroissante
    resultats.sort(key=lambda x: x["probabilite"], reverse=True)

    return resultats


def generer_et_sauvegarder_prediction(
    db: Session,
    id_quartier: int,
    jours_historique: int = 30,
    alpha: float = 0.15
) -> dict:
    """Génère une prédiction et la sauvegarde dans la table prediction"""

    # Calculer le risque
    risque = calculer_risque_coupure(db, id_quartier, jours_historique, alpha)

    # Créer la prédiction
    nouvelle_prediction = Prediction(
        id_quartier=id_quartier,
        probabilite=risque["probabilite"],
        niveau_risque=risque["niveau_risque"],
        date_prediction=datetime.now(),
        horizon="24h",
        recommandation=generer_recommandation(risque["niveau_risque"])
    )

    db.add(nouvelle_prediction)
    db.commit()
    db.refresh(nouvelle_prediction)

    return {
        "id_prediction": nouvelle_prediction.id_prediction,
        "risque": risque
    }


def generer_recommandation(niveau_risque: str) -> str:
    """Génère une recommandation basée sur le niveau de risque"""

    recommendations = {
        "critique": "Risque très élevé de coupure. Préparez les équipes d'intervention et informez les citoyens.",
        "eleve": "Risque élevé de délestage. Envisagez de prévoir des générateurs de secours.",
        "moyen": "Risque modéré. Surveillez la consommation et les signalements citoyens.",
        "faible": "Risque faible. Réseau stable, surveillance normale maintenue.",
        "tres_faible": "Risque très faible. Aucune action particulière requise."
    }

    return recommendations.get(niveau_risque, "Surveillance normale du réseau.")
