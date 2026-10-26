"""
Arbre de décision pour la prédiction des coupures électriques
Version simplifiée
"""

from datetime import datetime
from typing import Dict, List, Optional


def predire_risque_coupure(
    consommation: float,
    historique_pannes: int,
    jour: str,
    heure: int,
    temperature: Optional[float] = None,
    humidite: Optional[float] = None
) -> float:
    """Prédit le risque de coupure (0-100%)"""
    risque = 0.0

    # Facteur consommation
    if consommation > 90:
        risque += 35
    elif consommation > 75:
        risque += 25
    elif consommation > 60:
        risque += 15
    elif consommation > 45:
        risque += 8

    # Facteur historique
    if historique_pannes > 10:
        risque += 30
    elif historique_pannes > 5:
        risque += 20
    elif historique_pannes > 2:
        risque += 10
    elif historique_pannes > 0:
        risque += 5

    # Facteur heure de pointe
    if 18 <= heure <= 21:
        risque += 25
    elif 12 <= heure <= 14:
        risque += 20
    elif 7 <= heure <= 9:
        risque += 15
    elif 23 <= heure or heure <= 5:
        risque -= 10

    # Facteur jour
    jours_semaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
    if jour in jours_semaine:
        risque += 5
    else:
        risque -= 10

    # Facteurs météo
    if temperature is not None:
        if temperature > 35:
            risque += 20
        elif temperature < 10:
            risque += 15

    if humidite is not None:
        if humidite > 80:
            risque += 15

    return max(0, min(100, round(risque, 1)))


def get_niveau_risque(probabilite: float) -> str:
    """Convertit une probabilite en niveau de risque"""
    if probabilite >= 70:
        return "critique"
    elif probabilite >= 50:
        return "eleve"
    elif probabilite >= 25:
        return "moyen"
    elif probabilite >= 10:
        return "faible"
    else:
        return "tres_faible"


def get_couleur_risque(probabilite: float) -> str:
    """Retourne la couleur associee au niveau de risque"""
    if probabilite >= 70:
        return "#FF0000"
    elif probabilite >= 50:
        return "#FF6600"
    elif probabilite >= 25:
        return "#FFCC00"
    elif probabilite >= 10:
        return "#66CC00"
    else:
        return "#009900"


def predire_risques_multiple(quartiers_data: List[Dict]) -> List[Dict]:
    """Prediction des risques pour plusieurs quartiers"""
    predictions = []

    for quartier in quartiers_data:
        risque = predire_risque_coupure(
            consommation=quartier.get("consommation", 50),
            historique_pannes=quartier.get("historique_pannes", 0),
            jour=quartier.get("jour", "Lundi"),
            heure=quartier.get("heure", 12),
            temperature=quartier.get("temperature"),
            humidite=quartier.get("humidite")
        )

        predictions.append({
            "id_quartier": quartier.get("id"),
            "nom_quartier": quartier.get("nom"),
            "risque": risque,
            "niveau": get_niveau_risque(risque),
            "couleur": get_couleur_risque(risque),
            "date_prediction": datetime.now().isoformat()
        })

    predictions.sort(key=lambda x: x["risque"], reverse=True)
    return predictions
