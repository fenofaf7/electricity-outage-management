from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.quartier import Quartier
from app.algorithms.glouton import planifier_delestage, calculer_priorite_quartier
from app.algorithms.dijkstra import dijkstra, optimiser_distribution, trouver_chemins_alternatifs
from app.algorithms.decision_tree import predire_risque_coupure, get_niveau_risque
from app.api.deps import get_current_user

router = APIRouter(prefix="/test", tags=["Test Algorithmes"])


def construire_graphe_reel(db: Session) -> Dict[int, List[tuple]]:
    """Construit le graphe à partir des vrais quartiers"""

    quartiers = db.query(Quartier).all()
    ids_quartiers = [q.id_quartier for q in quartiers]

    graphe = {}

    # Trier les IDs pour créer des connexions logiques
    sorted_ids = sorted(ids_quartiers)

    for qid in sorted_ids:
        graphe[qid] = []

    # Créer des connexions entre quartiers proches
    for i, qid in enumerate(sorted_ids):
        if i < len(sorted_ids) - 1:
            distance = 2.5 + (sorted_ids[i+1] - qid) * 0.5
            graphe[qid].append((sorted_ids[i+1], round(distance, 1)))

        if i > 0:
            distance = 2.5 + (qid - sorted_ids[i-1]) * 0.5
            graphe[qid].append((sorted_ids[i-1], round(distance, 1)))

    # Ajouter des connexions supplémentaires pour Analakely (86) comme hub
    if 86 in graphe:
        for qid in sorted_ids[:15]:
            if qid != 86 and qid not in [g[0] for g in graphe[86]]:
                graphe[86].append((qid, 3.0))

    return graphe


def get_nom_quartier(db: Session, id_quartier: int) -> str:
    """Récupère el nom du quartier"""
    quartier = db.query(Quartier).filter(Quartier.id_quartier == id_quartier).first()
    return quartier.nom_quartier if quartier else f"Quartier {id_quartier}"


# ============================================
# PRÉDICTIONS
# ============================================

@router.get("/prediction/{consommation}/{pannes}/{heure}")
def test_prediction(
    consommation: float,
    pannes: int,
    heure: int
):
    """Test de prédiction avec paramètres"""
    risque = predire_risque_coupure(
        consommation=consommation,
        historique_pannes=pannes,
        jour="Lundi",
        heure=heure
    )

    return {
        "consommation": consommation,
        "historique_pannes": pannes,
        "heure": heure,
        "risque": risque,
        "niveau": get_niveau_risque(risque)
    }


@router.get("/predictions-multiples")
def test_predictions_multiples(db: Session = Depends(get_db)):
    """Test de prédictions pour plusieurs quartiers réels"""
    quartiers = db.query(Quartier).limit(10).all()

    resultats = []
    for q in quartiers:
        risque = predire_risque_coupure(
            consommation=50 + (q.id_quartier % 50),
            historique_pannes=q.id_quartier % 10,
            jour="Lundi",
            heure=19
        )
        resultats.append({
            "id_quartier": q.id_quartier,
            "nom_quartier": q.nom_quartier,
            "risque": risque,
            "niveau": get_niveau_risque(risque)
        })

    return resultats


@router.get("/scenarios")
def test_scenarios():
    """Test différents scénarios de prédiction"""

    scenarios = [
        {"nom": "Heure de pointe", "consommation": 85, "pannes": 5, "heure": 19},
        {"nom": "Nuit", "consommation": 35, "pannes": 1, "heure": 3},
        {"nom": "Canicule", "consommation": 95, "pannes": 8, "heure": 15},
        {"nom": "Week-end", "consommation": 55, "pannes": 2, "heure": 14},
    ]

    resultats = []
    for s in scenarios:
        risque = predire_risque_coupure(
            consommation=s["consommation"],
            historique_pannes=s["pannes"],
            jour="Lundi" if s["nom"] != "Week-end" else "Samedi",
            heure=s["heure"]
        )
        resultats.append({
            "scenario": s["nom"],
            "consommation": s["consommation"],
            "pannes": s["pannes"],
            "heure": s["heure"],
            "risque": risque,
            "niveau": get_niveau_risque(risque)
        })

    return resultats


# ============================================
# DIJKSTRA - RÉSEAU
# ============================================

@router.get("/reseau")
def test_reseau(db: Session = Depends(get_db)):
    """Test du réseau avec tes vrais quartiers"""
    graphe = construire_graphe_reel(db)
    quartiers = db.query(Quartier).all()

    return {
        "quartiers": [{"id": q.id_quartier, "nom": q.nom_quartier} for q in quartiers],
        "nb_quartiers": len(quartiers),
        "nb_connexions": sum(len(v) for v in graphe.values()) // 2
    }


@router.get("/reseau/chemin/{source}/{destination}")
def test_reseau_chemin(
    source: int,
    destination: int,
    db: Session = Depends(get_db)
):
    """Trouve le chemin optimal entre deux quartiers RÉELS"""
    graphe = construire_graphe_reel(db)

    quartier_source = db.query(Quartier).filter(Quartier.id_quartier == source).first()
    quartier_dest = db.query(Quartier).filter(Quartier.id_quartier == destination).first()

    if not quartier_source:
        return {"error": f"Quartier source {source} non trouvé"}
    if not quartier_dest:
        return {"error": f"Quartier destination {destination} non trouvé"}

    chemin, distance = dijkstra(graphe, source, destination)

    if not chemin:
        return {"error": "Aucun chemin trouvé"}

    noms_chemins = []
    for qid in chemin:
        q = db.query(Quartier).filter(Quartier.id_quartier == qid).first()
        noms_chemins.append(q.nom_quartier if q else str(qid))

    return {
        "source": source,
        "destination": destination,
        "source_nom": quartier_source.nom_quartier,
        "destination_nom": quartier_dest.nom_quartier,
        "chemin_ids": chemin,
        "chemin_noms": noms_chemins,
        "distance_km": round(distance, 2),
        "nb_etapes": len(chemin) - 1
    }


@router.get("/reseau/chemin-alternatifs/{source}/{destination}")
def test_reseau_chemins_alternatifs(
    source: int,
    destination: int,
    k: int = 3,
    db: Session = Depends(get_db)
):
    """Trouve plusieurs chemins alternatifs"""
    graphe = construire_graphe_reel(db)

    chemins = trouver_chemins_alternatifs(graphe, source, destination, k)

    resultats = []
    for chemin_ids, distance in chemins:
        noms = []
        for qid in chemin_ids:
            q = db.query(Quartier).filter(Quartier.id_quartier == qid).first()
            noms.append(q.nom_quartier if q else str(qid))

        resultats.append({
            "chemin_ids": chemin_ids,
            "chemin_noms": noms,
            "distance_km": round(distance, 2)
        })

    return {
        "source": source,
        "destination": destination,
        "nb_chemins": len(resultats),
        "chemins": resultats
    }


@router.get("/reseau/distributions")
def test_reseau_distributions(db: Session = Depends(get_db)):
    """Optimise la distribution depuis Analakely (86) vers les autres quartiers"""
    graphe = construire_graphe_reel(db)
    source = 86

    quartiers = db.query(Quartier).filter(Quartier.id_quartier != source).limit(10).all()
    destinations = [q.id_quartier for q in quartiers]

    resultats = optimiser_distribution(graphe, source, destinations)

    distributions = []
    for dest, (chemin_ids, distance) in resultats.items():
        q = db.query(Quartier).filter(Quartier.id_quartier == dest).first()
        noms = []
        for qid in chemin_ids:
            q_nom = db.query(Quartier).filter(Quartier.id_quartier == qid).first()
            noms.append(q_nom.nom_quartier if q_nom else str(qid))

        distributions.append({
            "destination": dest,
            "destination_nom": q.nom_quartier if q else str(dest),
            "chemin_ids": chemin_ids,
            "chemin_noms": noms,
            "distance_km": round(distance, 2)
        })

    distributions.sort(key=lambda x: x["distance_km"])

    return {
        "source": source,
        "source_nom": "Analakely",
        "destinations": distributions
    }


# ============================================
# GLOUTON - DÉLESTAGE
# ============================================

@router.get("/delestage")
def test_delestage(db: Session = Depends(get_db)):
    """Test de délestage avec quartiers réels"""
    quartiers = db.query(Quartier).all()

    quartiers_data = []
    for q in quartiers:
        quartiers_data.append({
            "id": q.id_quartier,
            "nom": q.nom_quartier,
            "consommation": 25 + (q.id_quartier % 50),
            "priorite": (q.id_quartier % 5) + 1
        })

    resultat = planifier_delestage(quartiers_data, puissance_disponible=150, puissance_securite=10)

    return {
        "puissance_disponible": 150,
        "puissance_securite": 10,
        "nb_quartiers_total": len(quartiers),
        **resultat
    }


@router.get("/delestage/{puissance}")
def test_delestage_puissance(
    puissance: float,
    db: Session = Depends(get_db)
):
    """Test de délestage avec puissance personnalisée"""
    quartiers = db.query(Quartier).all()

    quartiers_data = []
    for q in quartiers:
        quartiers_data.append({
            "id": q.id_quartier,
            "nom": q.nom_quartier,
            "consommation": 25 + (q.id_quartier % 50),
            "priorite": (q.id_quartier % 5) + 1
        })

    resultat = planifier_delestage(quartiers_data, puissance_disponible=puissance, puissance_securite=10)

    return {
        "puissance_disponible": puissance,
        "puissance_securite": 10,
        **resultat
    }


@router.get("/priorite-quartier")
def test_priorite_quartier(db: Session = Depends(get_db)):
    """Test de priorité des quartiers"""
    quartiers = db.query(Quartier).limit(10).all()

    resultats = []
    for q in quartiers:
        priorite = calculer_priorite_quartier(
            population=30000 + (q.id_quartier % 10000),
            hopitaux=1 if q.id_quartier in [86, 89] else 0,
            industries=2 if q.id_quartier in [86, 90] else 0,
            pannes_historiques=q.id_quartier % 10,
            est_zone_sensible=q.id_quartier in [86, 89, 93]
        )

        signification = {
            1: "Très critique (ne pas délester)",
            2: "Critique",
            3: "Moyen",
            4: "Peu critique",
            5: "Non critique (délester en priorité)"
        }

        resultats.append({
            "id_quartier": q.id_quartier,
            "nom_quartier": q.nom_quartier,
            "priorite": priorite,
            "signification": signification.get(priorite, "Inconnu")
        })

    return resultats


# ============================================
# TEST TOUT EN UN
# ============================================

@router.get("/all")
def test_all(db: Session = Depends(get_db)):
    """Test tous les algorithmes en une fois"""

    # 1. Prédiction
    prediction = predire_risque_coupure(
        consommation=85,
        historique_pannes=6,
        jour="Lundi",
        heure=19
    )

    # 2. Dijkstra
    graphe = construire_graphe_reel(db)
    chemin, distance = dijkstra(graphe, 86, 100)
    noms_chemin = []
    for qid in chemin:
        q = db.query(Quartier).filter(Quartier.id_quartier == qid).first()
        noms_chemin.append(q.nom_quartier if q else str(qid))

    # 3. Délestage
    quartiers = db.query(Quartier).all()
    quartiers_data = [{"id": q.id_quartier, "consommation": 30, "priorite": 3} for q in quartiers]
    delestage = planifier_delestage(quartiers_data, 150, 10)

    return {
        "prediction": {
            "risque": prediction,
            "niveau": get_niveau_risque(prediction)
        },
        "dijkstra_86_to_100": {
            "chemin_ids": chemin if chemin else [],
            "chemin_noms": noms_chemin,
            "distance_km": round(distance, 2) if chemin else None
        },
        "delestage_150mw": {
            "quartiers_a_couper": len(delestage.get("quartiers_a_couper", [])),
            "puissance_coupee": delestage.get("puissance_coupee", 0),
            "pourcentage": delestage.get("pourcentage_coupe", 0)
        }
    }
