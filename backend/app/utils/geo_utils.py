from math import radians, sin, cos, sqrt, atan2

def distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcule la distance entre deux points GPS"""
    R = 6371  # Rayon terrestre en km
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def est_dans_zone(lat: float, lon: float, centre_lat: float, centre_lon: float, rayon_km: float) -> bool:
    """Vérifie si un point est dans un rayon donné"""
    return distance_km(lat, lon, centre_lat, centre_lon) <= rayon_km
