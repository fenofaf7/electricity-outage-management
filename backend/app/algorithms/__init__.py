from app.algorithms.decision_tree import (
    predire_risque_coupure,
    get_niveau_risque,
    get_couleur_risque,
    predire_risques_multiple
)

from app.algorithms.glouton import (
    planifier_delestage,
    calculer_priorite_quartier,
    optimiser_delestage
)

from app.algorithms.dijkstra import (
    ReseauElectrique,
    dijkstra,
    optimiser_distribution,
    trouver_chemins_alternatifs,
    calculer_cout_reseau
)

# app/algorithms/__init__.py
from app.algorithms.prediction import (
    calculer_risque_coupure,
    calculer_risques_tous_quartiers,
    generer_et_sauvegarder_prediction,
    generer_recommandation
)
