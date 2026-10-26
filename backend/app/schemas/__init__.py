from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest
from app.schemas.utilisateur import UtilisateurBase, UtilisateurCreate, UtilisateurUpdate, UtilisateurResponse
from app.schemas.coupure import CoupureBase, CoupureCreate, CoupureUpdate, CoupureResponse
from app.schemas.signalement import SignalementBase, SignalementCreate, SignalementUpdate, SignalementResponse
from app.schemas.quartier import QuartierBase, QuartierCreate, QuartierUpdate, QuartierResponse
from app.schemas.prediction import PredictionBase, PredictionCreate, PredictionResponse
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationResponse
from app.schemas.rapport import RapportBase, RapportCreate, RapportUpdate, RapportResponse
from app.schemas.consommation import ConsommationBase, ConsommationCreate, ConsommationUpdate, ConsommationResponse
from app.schemas.historique_coupure import HistoriqueCoupureBase, HistoriqueCoupureCreate, HistoriqueCoupureUpdate, HistoriqueCoupureResponse
from app.schemas.statistique import StatsGlobales, StatsQuartier, StatsPeriode, RisquePrediction, DashboardData
