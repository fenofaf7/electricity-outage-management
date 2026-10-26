"""
Test des algorithmes de prédiction, délestage et optimisation
"""

import sys
import os

# Ajoute le chemin du projet
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.algorithms import (
    predire_risque_coupure,
    get_niveau_risque,
    get_couleur_risque,
    predire_risques_multiple,
    planifier_delestage,
    calculer_priorite_quartier,
    optimiser_delestage,
    dijkstra,
    ReseauElectrique
)

def test_prediction():
    """Test la prédiction des coupures"""
    print("\n" + "=" * 60)
    print("🧪 TEST 1: Prédiction des coupures")
    print("=" * 60)

    # Test simple
    risque = predire_risque_coupure(
        consommation=85.5,
        historique_pannes=7,
        jour="Lundi",
        heure=19,
        temperature=36,
        humidite=85
    )

    print(f"\n📊 Prédiction pour un quartier:")
    print(f"   - Consommation: 85.5 MW")
    print(f"   - Historique pannes: 7")
    print(f"   - Jour: Lundi, Heure: 19h")
    print(f"   - Température: 36°C, Humidité: 85%")
    print(f"\n   🔮 Risque de coupure: {risque}%")
    print(f"   📈 Niveau: {get_niveau_risque(risque)}")
    print(f"   🎨 Couleur: {get_couleur_risque(risque)}")

    # Test multiples quartiers
    quartiers = [
        {"id": 1, "nom": "Analakely", "consommation": 78.5, "historique_pannes": 3, "jour": "Lundi", "heure": 19},
        {"id": 2, "nom": "Mahamasina", "consommation": 92.3, "historique_pannes": 12, "jour": "Mardi", "heure": 20},
        {"id": 3, "nom": "Anosy", "consommation": 45.2, "historique_pannes": 1, "jour": "Mercredi", "heure": 14},
    ]

    predictions = predire_risques_multiple(quartiers)

    print(f"\n📊 Prédictions multiples:")
    for p in predictions:
        print(f"   - {p['nom_quartier']}: {p['risque']}% ({p['niveau']})")

def test_delestage():
    """Test la planification du délestage"""
    print("\n" + "=" * 60)
    print("🧪 TEST 2: Planification du délestage")
    print("=" * 60)

    quartiers = [
        {"id": 1, "nom": "Analakely", "consommation": 45.2, "priorite": 2},
        {"id": 2, "nom": "Mahamasina", "consommation": 38.7, "priorite": 1},
        {"id": 3, "nom": "67 Ha", "consommation": 52.3, "priorite": 3},
        {"id": 4, "nom": "Anosy", "consommation": 28.9, "priorite": 4},
        {"id": 5, "nom": "Isotry", "consommation": 35.5, "priorite": 2},
    ]

    print(f"\n📊 Quartiers:")
    for q in quartiers:
        print(f"   - {q['nom']}: {q['consommation']} MW (priorité {q['priorite']})")

    resultat = planifier_delestage(quartiers, puissance_disponible=120)

    print(f"\n🎯 Résultat du délestage:")
    print(f"   - Puissance disponible: 120 MW")
    print(f"   - Puissance restante: {resultat['puissance_restante']} MW")
    print(f"   - Puissance coupée: {resultat['puissance_coupee']} MW")
    print(f"   - Pourcentage coupé: {resultat['pourcentage_coupe']}%")
    print(f"   - Quartiers à couper: {len(resultat['quartiers_a_couper'])}")

    for q in resultat['quartiers_a_couper']:
        print(f"     • {q['nom_quartier']}: {q['consommation']} MW")

def test_priorite():
    """Test le calcul de priorité des quartiers"""
    print("\n" + "=" * 60)
    print("🧪 TEST 3: Calcul de priorité des quartiers")
    print("=" * 60)

    # Quartier avec hôpital
    priorite = calculer_priorite_quartier(
        population=30000,
        hopitaux=1,
        industries=2,
        pannes_historiques=3,
        est_zone_sensible=False
    )
    print(f"\n🏥 Quartier avec hôpital:")
    print(f"   - Priorité: {priorite} (1=critique, 5=non critique)")

    # Quartier zone sensible (aéroport)
    priorite = calculer_priorite_quartier(
        population=10000,
        hopitaux=0,
        industries=5,
        pannes_historiques=2,
        est_zone_sensible=True
    )
    print(f"\n✈️ Zone sensible (aéroport):")
    print(f"   - Priorité: {priorite} (1=critique, 5=non critique)")

    # Petit quartier résidentiel
    priorite = calculer_priorite_quartier(
        population=5000,
        hopitaux=0,
        industries=0,
        pannes_historiques=0,
        est_zone_sensible=False
    )
    print(f"\n🏠 Petit quartier résidentiel:")
    print(f"   - Priorité: {priorite} (1=critique, 5=non critique)")

def test_dijkstra():
    """Test l'optimisation du réseau"""
    print("\n" + "=" * 60)
    print("🧪 TEST 4: Optimisation du réseau (Dijkstra)")
    print("=" * 60)

    # Créer le réseau
    reseau = ReseauElectrique()
    reseau.ajouter_postes([1, 2, 3, 4, 5])
    reseau.ajouter_liaison(1, 2, 10)   # 10 km
    reseau.ajouter_liaison(2, 3, 15)   # 15 km
    reseau.ajouter_liaison(3, 4, 12)   # 12 km
    reseau.ajouter_liaison(4, 5, 8)    # 8 km
    reseau.ajouter_liaison(1, 4, 25)   # 25 km (direct mais plus long)
    reseau.ajouter_liaison(2, 4, 18)   # 18 km

    print(f"\n📊 Réseau électrique:")
    print(f"   Postes: 1, 2, 3, 4, 5")
    print(f"   Connexions: 1-2(10km), 2-3(15km), 3-4(12km), 4-5(8km), 1-4(25km), 2-4(18km)")

    # Trouver le chemin optimal
    chemin, distance = dijkstra(reseau.graph, 1, 5)

    print(f"\n🎯 Chemin optimal de 1 à 5:")
    print(f"   - Chemin: {chemin}")
    print(f"   - Distance: {distance} km")

    # Autres chemins
    chemin2, dist2 = dijkstra(reseau.graph, 2, 5)
    print(f"\n🎯 Chemin optimal de 2 à 5:")
    print(f"   - Chemin: {chemin2}")
    print(f"   - Distance: {dist2} km")

def main():
    """Exécute tous les tests"""
    print("\n" + "🚀" * 30)
    print("   TEST DES ALGORITHMES")
    print("🚀" * 30)

    try:
        test_prediction()
        test_delestage()
        test_priorite()
        test_dijkstra()

        print("\n" + "✅" * 30)
        print("   TOUS LES TESTS ONT RÉUSSI !")
        print("✅" * 30)

    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
