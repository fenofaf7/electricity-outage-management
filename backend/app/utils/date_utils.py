from datetime import datetime, timedelta

def formater_date(date: datetime, format: str = "%d/%m/%Y %H:%M") -> str:
    """Formate une date pour l'affichage"""
    return date.strftime(format)

def calculer_duree(debut: datetime, fin: datetime) -> int:
    """Calcule la durée en minutes"""
    return int((fin - debut).total_seconds() / 60)

def est_periode_pointe(heure: int) -> bool:
    """Vérifie si l'heure est en période de pointe"""
    return 18 <= heure <= 21 or 12 <= heure <= 14
