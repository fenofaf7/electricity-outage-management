import re

def valider_email(email: str) -> bool:
    """Valide le format d'un email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def valider_telephone(telephone: str) -> bool:
    """Valide un numéro malgache"""
    pattern = r'^03[0-9]{8}$|^05[0-9]{8}$|^07[0-9]{8}$'
    return re.match(pattern, telephone) is not None
