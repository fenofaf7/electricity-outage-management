-- =====================================================
-- DONNÉES STATIQUES (sans mot de passe)
-- Version finale - SANS NOTIFICATIONS
-- =====================================================

-- Nettoyer les tables avant insertion (ordre inverse des dépendances)
DELETE FROM prediction;
DELETE FROM notification;
DELETE FROM historique_coupure;
DELETE FROM signalement;
DELETE FROM consommation;
DELETE FROM coupure;
DELETE FROM service_externe;
DELETE FROM quartier;
DELETE FROM ville;
DELETE FROM role;

-- =====================================================
-- INSERTION DANS L'ORDRE DES DÉPENDANCES
-- =====================================================

-- 1. Rôles
INSERT INTO role (nom_role) VALUES
    ('citoyen'),
    ('administrateur'),
    ('gestionnaire_coupure'),
    ('analyste');

-- 2. Villes
INSERT INTO ville (nom_ville) VALUES
    ('Antananarivo'),
    ('Antsiranana'),
    ('Fianarantsoa'),
    ('Mahajanga'),
    ('Toamasina'),
    ('Toliara');

-- 3. Quartiers
INSERT INTO quartier (nom_quartier, latitude, longitude, statut, id_ville) VALUES
    ('Analakely', -18.9072, 47.5363, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Antaninarenina', -18.9142, 47.5314, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Isotry', -18.9225, 47.5286, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Mahamasina', -18.9019, 47.5264, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('67 Ha', -18.8897, 47.5436, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Andraharo', -18.8842, 47.5319, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Anjanahary', -18.8914, 47.5408, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Anosy', -18.9197, 47.5292, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Antanimena', -18.9239, 47.5219, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Faravohitra', -18.9117, 47.5233, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Antananarivo')),
    ('Tanambao V', -18.1522, 49.4019, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Toamasina')),
    ('Morarano', -18.1636, 49.3944, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Toamasina')),
    ('Ambatoharanana', -18.1483, 49.4081, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Toamasina')),
    ('Mahavoky Avaratra', -15.7025, 46.3456, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Mahajanga')),
    ('Amborovy', -15.6825, 46.3503, 'actif', (SELECT id_ville FROM ville WHERE nom_ville = 'Mahajanga'));

-- 4. Services externes
INSERT INTO service_externe (nom_service, type_service, endpoint) VALUES
    ('Firebase Cloud Messaging', 'notification', 'https://fcm.googleapis.com/fcm/send'),
    ('Jirama API', 'donnees', 'https://api.jirama.mg/v1'),
    ('Meteo Madagascar', 'meteo', 'https://api.meteo.mg/forecast');

-- 5. Coupures
INSERT INTO coupure (date_debut, date_fin, duree_minutes, type_coupure, cause, statut, id_quartier) VALUES
    ('2026-05-20 08:30:00', '2026-05-20 10:30:00', 120, 'programmee', 'Maintenance préventive', 'termine', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-21 14:00:00', '2026-05-21 16:15:00', 135, 'imprevue', 'Chute d''arbre sur ligne', 'termine', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Antaninarenina')),
    ('2026-05-22 09:00:00', '2026-05-22 11:30:00', 150, 'programmee', 'Travaux sur réseau', 'termine', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Isotry')),
    ('2026-05-26 07:15:00', NULL, NULL, 'imprevue', 'Défaut sur transformateur', 'en_cours', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Mahamasina')),
    ('2026-05-26 08:00:00', NULL, NULL, 'programmee', 'Travaux planifiés', 'en_cours', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Anosy')),
    ('2026-05-27 10:00:00', NULL, NULL, 'programmee', 'Maintenance réseau', 'planifiee', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Tanambao V'));

-- 6. Consommations
INSERT INTO consommation (date_heure, valeur, unite, source, id_quartier) VALUES
    ('2026-05-26 00:00:00', 45.5, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-26 01:00:00', 42.3, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-26 02:00:00', 40.1, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-26 06:00:00', 52.8, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-26 07:00:00', 78.2, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-26 08:00:00', 95.4, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely')),
    ('2026-05-26 12:00:00', 72.3, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Antaninarenina')),
    ('2026-05-26 13:00:00', 68.9, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Antaninarenina')),
    ('2026-05-26 18:00:00', 85.7, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Isotry')),
    ('2026-05-26 19:00:00', 92.1, 'MW', 'estimation', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Isotry'));

-- 7. Prédictions
INSERT INTO prediction (date_prediction, probabilite, niveau_risque, algorithme, horizon, id_quartier, id_coupure) VALUES
    (NOW() + INTERVAL '1 day', 75.5, 'élevé', 'decision_tree', '24h', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Mahamasina'), NULL),
    (NOW() + INTERVAL '2 day', 45.2, 'moyen', 'decision_tree', '48h', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Anosy'), NULL),
    (NOW() + INTERVAL '1 day', 85.0, 'critique', 'regression_logistique', '24h', (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Tanambao V'), NULL);
