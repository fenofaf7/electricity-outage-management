-- =====================================================
-- PLATEFORME DE GESTION ET PRÉDICTION DES COUPURES
-- Script d'initialisation de la base de données
-- =====================================================

-- 1. TABLE role
CREATE TABLE IF NOT EXISTS role (
    id_role SERIAL PRIMARY KEY,
    nom_role VARCHAR(50) UNIQUE NOT NULL
);

-- 2. TABLE ville
CREATE TABLE IF NOT EXISTS ville (
    id_ville SERIAL PRIMARY KEY,
    nom_ville VARCHAR(100) NOT NULL
);

-- 3. TABLE quartier
CREATE TABLE IF NOT EXISTS quartier (
    id_quartier SERIAL PRIMARY KEY,
    nom_quartier VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    statut VARCHAR(50) DEFAULT 'actif',
    id_ville INTEGER NOT NULL REFERENCES ville(id_ville) ON DELETE CASCADE
);

-- 4. TABLE utilisateur
CREATE TABLE IF NOT EXISTS utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'actif',
    id_role INTEGER NOT NULL REFERENCES role(id_role),
    id_ville INTEGER NOT NULL REFERENCES ville(id_ville)
);

-- 5. TABLE citoyen
CREATE TABLE IF NOT EXISTS citoyen (
    id_citoyen INTEGER PRIMARY KEY REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    adresse TEXT,
    id_quartier_pref INTEGER REFERENCES quartier(id_quartier)
);

-- 6. TABLE utilisateur_administratif
CREATE TABLE IF NOT EXISTS utilisateur_administratif (
    id_admin_user INTEGER PRIMARY KEY REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- 7. TABLE administrateur
CREATE TABLE IF NOT EXISTS administrateur (
    id_administrateur INTEGER PRIMARY KEY REFERENCES utilisateur_administratif(id_admin_user) ON DELETE CASCADE,
    niveau_acces VARCHAR(50),
    permissions TEXT
);

-- 8. TABLE gestionnaire_coupure
CREATE TABLE IF NOT EXISTS gestionnaire_coupure (
    id_gestionnaire INTEGER PRIMARY KEY REFERENCES utilisateur_administratif(id_admin_user) ON DELETE CASCADE,
    adresse VARCHAR(255),
    actions TEXT
);

-- 9. TABLE analyste
CREATE TABLE IF NOT EXISTS analyste (
    id_analyste INTEGER PRIMARY KEY REFERENCES utilisateur_administratif(id_admin_user) ON DELETE CASCADE,
    adresse VARCHAR(255),
    actions TEXT
);

-- 10. TABLE coupure
CREATE TABLE IF NOT EXISTS coupure (
    id_coupure SERIAL PRIMARY KEY,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP,
    duree_minutes INTEGER,
    type_coupure VARCHAR(50),
    cause TEXT,
    statut VARCHAR(50) DEFAULT 'en_cours',
    id_quartier INTEGER NOT NULL REFERENCES quartier(id_quartier)
);

-- 11. TABLE signalement
CREATE TABLE IF NOT EXISTS signalement (
    id_signalement SERIAL PRIMARY KEY,
    description TEXT,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'en_attente',
    type_signalement VARCHAR(50),
    id_quartier INTEGER NOT NULL REFERENCES quartier(id_quartier),
    id_citoyen INTEGER NOT NULL REFERENCES citoyen(id_citoyen),
    id_coupure INTEGER REFERENCES coupure(id_coupure)
);

-- 12. TABLE historique_coupure
CREATE TABLE IF NOT EXISTS historique_coupure (
    id_historique SERIAL PRIMARY KEY,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP,
    duree_minutes INTEGER,
    frequence INTEGER,
    commentaire TEXT,
    id_coupure INTEGER NOT NULL REFERENCES coupure(id_coupure) ON DELETE CASCADE
);

-- 13. TABLE consommation
CREATE TABLE IF NOT EXISTS consommation (
    id_consommation SERIAL PRIMARY KEY,
    date_heure TIMESTAMP NOT NULL,
    valeur DOUBLE PRECISION NOT NULL,
    unite VARCHAR(20),
    source VARCHAR(100),
    id_quartier INTEGER NOT NULL REFERENCES quartier(id_quartier),
    id_coupure INTEGER REFERENCES coupure(id_coupure)
);

-- 14. TABLE prediction
CREATE TABLE IF NOT EXISTS prediction (
    id_prediction SERIAL PRIMARY KEY,
    date_prediction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    probabilite DOUBLE PRECISION CHECK (probabilite >= 0 AND probabilite <= 100),
    niveau_risque VARCHAR(50),
    algorithme VARCHAR(100),
    horizon VARCHAR(50),
    id_coupure INTEGER REFERENCES coupure(id_coupure),
    id_quartier INTEGER NOT NULL REFERENCES quartier(id_quartier)
);

-- 15. TABLE service_externe
CREATE TABLE IF NOT EXISTS service_externe (
    id_service SERIAL PRIMARY KEY,
    nom_service VARCHAR(100) NOT NULL,
    type_service VARCHAR(50),
    endpoint VARCHAR(255)
);

-- 16. TABLE notification
CREATE TABLE IF NOT EXISTS notification (
    id_notification SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50),
    statut VARCHAR(50) DEFAULT 'envoye',
    id_citoyen INTEGER NOT NULL REFERENCES citoyen(id_citoyen),
    id_coupure INTEGER REFERENCES coupure(id_coupure),
    id_service INTEGER REFERENCES service_externe(id_service)
);

-- 17. TABLE rapport
CREATE TABLE IF NOT EXISTS rapport (
    id_rapport SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type_rapport VARCHAR(50),
    statut VARCHAR(50) DEFAULT 'brouillon',
    id_admin_user INTEGER NOT NULL REFERENCES utilisateur_administratif(id_admin_user),
    id_coupure INTEGER REFERENCES coupure(id_coupure)
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_utilisateur_role ON utilisateur(id_role);
CREATE INDEX IF NOT EXISTS idx_coupure_quartier ON coupure(id_quartier);
CREATE INDEX IF NOT EXISTS idx_coupure_dates ON coupure(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_signalement_quartier ON signalement(id_quartier);
CREATE INDEX IF NOT EXISTS idx_signalement_citoyen ON signalement(id_citoyen);
CREATE INDEX IF NOT EXISTS idx_signalement_statut ON signalement(statut);
CREATE INDEX IF NOT EXISTS idx_notification_citoyen ON notification(id_citoyen, statut);
CREATE INDEX IF NOT EXISTS idx_consommation_quartier_date ON consommation(id_quartier, date_heure);
CREATE INDEX IF NOT EXISTS idx_prediction_quartier ON prediction(id_quartier, date_prediction);
CREATE INDEX IF NOT EXISTS idx_prediction_coupure ON prediction(id_coupure);
CREATE INDEX IF NOT EXISTS idx_historique_coupure ON historique_coupure(id_coupure);
CREATE INDEX IF NOT EXISTS idx_rapport_admin ON rapport(id_admin_user);
CREATE INDEX IF NOT EXISTS idx_rapport_coupure ON rapport(id_coupure);
CREATE INDEX IF NOT EXISTS idx_quartier_ville ON quartier(id_ville);

-- =====================================================
-- MESSAGES DE CONFIRMATION
-- =====================================================
SELECT '✅ Tables créées avec succès !' AS message;
