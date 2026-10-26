"""
Algorithme de Dijkstra pour l'optimisation du réseau électrique
Trouve le chemin optimal pour la distribution d'électricité
"""

import heapq
from typing import Dict, List, Tuple, Optional

class ReseauElectrique:
    """Représentation du réseau électrique"""

    def __init__(self):
        self.graph: Dict[int, List[Tuple[int, float]]] = {}

    def ajouter_liaison(self, source: int, destination: int, distance: float):
        """Ajoute une liaison entre deux nœuds"""
        if source not in self.graph:
            self.graph[source] = []
        if destination not in self.graph:
            self.graph[destination] = []

        self.graph[source].append((destination, distance))
        self.graph[destination].append((source, distance))

    def ajouter_postes(self, postes: List[int]):
        """Ajoute des postes électriques"""
        for poste in postes:
            if poste not in self.graph:
                self.graph[poste] = []


def dijkstra(
    graph: Dict[int, List[Tuple[int, float]]],
    start: int,
    end: int
) -> Tuple[List[int], float]:
    """
    Algorithme de Dijkstra pour trouver le chemin le plus court

    Paramètres:
    - graph: Dictionnaire {noeud: [(voisin, poids), ...]}
    - start: Nœud de départ
    - end: Nœud d'arrivée

    Retourne:
    - chemin: Liste des nœuds du chemin optimal
    - distance: Distance totale
    """

    # Initialisation
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {node: None for node in graph}

    # File de priorité
    pq = [(0, start)]

    while pq:
        current_dist, current = heapq.heappop(pq)

        # Si on a trouvé la destination
        if current == end:
            break

        # Si la distance est obsolète
        if current_dist > distances[current]:
            continue

        # Explorer les voisins
        for neighbor, weight in graph.get(current, []):
            distance = current_dist + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(pq, (distance, neighbor))

    # Reconstruire le chemin
    chemin = []
    current = end
    while current is not None:
        chemin.insert(0, current)
        current = previous[current]

    # Vérifier si un chemin a été trouvé
    if chemin[0] != start:
        return [], float('inf')

    return chemin, distances[end]


def optimiser_distribution(
    graph: Dict[int, List[Tuple[int, float]]],
    source: int,
    destinations: List[int]
) -> Dict[int, Tuple[List[int], float]]:
    """
    Optimise la distribution vers plusieurs destinations

    Paramètres:
    - graph: Réseau électrique
    - source: Poste source
    - destinations: Liste des destinations

    Retourne: Dictionnaire {destination: (chemin, distance)}
    """
    resultats = {}

    for dest in destinations:
        chemin, distance = dijkstra(graph, source, dest)
        resultats[dest] = (chemin, distance)

    return resultats


def trouver_chemins_alternatifs(
    graph: Dict[int, List[Tuple[int, float]]],
    start: int,
    end: int,
    k: int = 3
) -> List[Tuple[List[int], float]]:
    """
    Trouve les k chemins les plus courts (Yen's algorithm simplifié)

    Paramètres:
    - graph: Réseau électrique
    - start: Nœud de départ
    - end: Nœud d'arrivée
    - k: Nombre de chemins à trouver

    Retourne: Liste des (chemin, distance)
    """
    chemins = []

    # Premier chemin (Dijkstra)
    chemin1, dist1 = dijkstra(graph, start, end)
    if not chemin1:
        return chemins

    chemins.append((chemin1, dist1))

    # Pour les chemins suivants (simplifié)
    # Dans une implémentation complète, on utiliserait l'algorithme de Yen
    # Version simplifiée pour démonstration
    for i in range(1, k):
        # Créer une copie du graphique sans certaines arêtes
        graph_temp = {node: edges.copy() for node, edges in graph.items()}

        # Supprimer une arête du chemin précédent
        chemin_prec = chemins[-1][0]
        for j in range(len(chemin_prec) - 1):
            u, v = chemin_prec[j], chemin_prec[j+1]
            graph_temp[u] = [(n, w) for n, w in graph_temp[u] if n != v]

        # Trouver un nouveau chemin
        nouveau_chemin, nouvelle_dist = dijkstra(graph_temp, start, end)
        if nouveau_chemin and nouveau_chemin not in [c[0] for c in chemins]:
            chemins.append((nouveau_chemin, nouvelle_dist))
        else:
            break

    return chemins


def calculer_cout_reseau(
    graph: Dict[int, List[Tuple[int, float]]],
    flux: Dict[Tuple[int, int], float]
) -> float:
    """
    Calcule le coût total du réseau (pertes + distance)

    Paramètres:
    - graph: Réseau électrique
    - flux: Dictionnaire {(source, dest): puissance}

    Retourne: Coût total
    """
    cout_total = 0.0

    for (source, dest), puissance in flux.items():
        # Trouver le chemin optimal
        chemin, distance = dijkstra(graph, source, dest)

        if chemin:
            # Coût = distance * puissance * facteur perte
            # Facteur perte approximatif : 0.05 (5% de perte par 100 km)
            pertes = distance * 0.0005 * puissance
            cout_total += distance * puissance + pertes

    return round(cout_total, 2)
