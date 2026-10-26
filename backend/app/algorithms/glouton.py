"""
Algorithme glouton pour la gestion du délestage
Permet de décider quels quartiers couper en priorité
"""

from typing import Dict, List, Tuple

def planifier_delestage(
    quartiers: List[Dict],
    puissance_disponible: float,
    puissance_securite: float = 10
) -> Dict:
    """
    Planifie le délestage des quartiers

    Paramètres:
    - quartiers: Liste des quartiers avec leur consommation
                 [{"id": 1, "nom": "Analakely", "consommation": 45.2, "priorite": 1}, ...]
    - puissance_disponible: Puissance totale disponible (MW)
    - puissance_securite: Marge de sécurité à conserver (MW)

    Retourne:
    {
        "quartiers_a_couper": [...],
        "puissance_restante": float,
        "puissance_coupee": float
    }
    """

    # Trier les quartiers par priorité (critique d'abord)
    # priorité 1 = critique (à couper en dernier)
    # priorité 5 = non critique (à couper en premier)
    quartiers_tries = sorted(
        quartiers,
        key=lambda x: (x.get("priorite", 3), x.get("consommation", 0)),
        reverse=False  # Priorité basse = à couper en premier
    )

    quartiers_a_couper = []
    puissance_restante = puissance_disponible - puissance_securite
    puissance_coupee = 0

    for quartier in quartiers_tries:
        consommation = quartier.get("consommation", 0)

        # Si la consommation dépasse la puissance restante, on coupe
        if consommation > puissance_restante:
            quartiers_a_couper.append({
                "id_quartier": quartier.get("id"),
                "nom_quartier": quartier.get("nom"),
                "consommation": consommation,
                "duree_estimee": 60,  # minutes
                "priorite": quartier.get("priorite", 3)
            })
            puissance_coupee += consommation
        else:
            puissance_restante -= consommation

    return {
        "quartiers_a_couper": quartiers_a_couper,
        "puissance_restante": round(puissance_restante, 2),
        "puissance_coupee": round(puissance_coupee, 2),
        "pourcentage_coupe": round((puissance_coupee / puissance_disponible) * 100, 1)
    }


def calculer_priorite_quartier(
    population: int,
    hopitaux: int,
    industries: int,
    pannes_historiques: int,
    est_zone_sensible: bool = False
) -> int:
    """
    Calcule la priorité d'un quartier (1 = critique, 5 = non critique)

    Paramètres:
    - population: Nombre d'habitants
    - hopitaux: Nombre d'hôpitaux dans le quartier
    - industries: Nombre d'industries
    - pannes_historiques: Nombre de pannes récentes
    - est_zone_sensible: Si c'est une zone sensible (aéroport, gare...)

    Retourne: Priorité de 1 (très critique) à 5 (peu critique)
    """
    score = 0

    # Facteur population
    if population > 50000:
        score += 5
    elif population > 20000:
        score += 3

    # Facteur hôpitaux (très important)
    if hopitaux > 0:
        score += 10 * hopitaux

    # Facteur industries
    if industries > 5:
        score += 2
    elif industries > 0:
        score += 1

    # Facteur pannes historiques (plus de pannes = plus critique)
    if pannes_historiques > 10:
        score += 3
    elif pannes_historiques > 5:
        score += 2

    # Zone sensible
    if est_zone_sensible:
        score += 8

    # Conversion score en priorité (1 = critique, 5 = non critique)
    if score >= 15:
        return 1  # Très critique - à couper en dernier
    elif score >= 10:
        return 2  # Critique
    elif score >= 6:
        return 3  # Moyen
    elif score >= 3:
        return 4  # Peu critique
    else:
        return 5  # Non critique - à couper en premier


def optimiser_delestage(
    quartiers: List[Dict],
    puissance_disponible: float,
    duree_max: int = 120
) -> Dict:
    """
    Optimise le délestage en alternant les quartiers

    Paramètres:
    - quartiers: Liste des quartiers
    - puissance_disponible: Puissance disponible (MW)
    - duree_max: Durée maximale de délestage par quartier (minutes)

    Retourne: Plan de délestage optimisé
    """
    resultat = planifier_delestage(quartiers, puissance_disponible)

    # Ajouter la durée estimée pour chaque quartier
    for quartier in resultat["quartiers_a_couper"]:
        # Plus la consommation est élevée, plus la durée est courte
        consommation = quartier["consommation"]
        if consommation > 50:
            quartier["duree_estimee"] = min(duree_max, 45)
        elif consommation > 30:
            quartier["duree_estimee"] = min(duree_max, 60)
        else:
            quartier["duree_estimee"] = min(duree_max, 90)

    return resultat
