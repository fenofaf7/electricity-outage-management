-- 1. Lier les utilisateurs administratifs
INSERT INTO utilisateur_administratif (id_admin_user)
SELECT id_utilisateur FROM utilisateur
WHERE email IN ('admin@gmail.com', 'gestionnaire@gmail.com', 'analyste@gmail.com')
ON CONFLICT (id_admin_user) DO NOTHING;

-- 2. Lier l'administrateur
INSERT INTO administrateur (id_administrateur, niveau_acces, permissions)
SELECT id_utilisateur, 'total', '["all","create","read","update","delete"]'
FROM utilisateur WHERE email = 'admin@gmail.com'
ON CONFLICT (id_administrateur) DO NOTHING;

-- 3. Lier le gestionnaire
INSERT INTO gestionnaire_coupure (id_gestionnaire, adresse, actions)
SELECT id_utilisateur, 'Bureau JIRAMA Antananarivo', '["gerer_coupures","traiter_signalements","envoyer_notifications"]'
FROM utilisateur WHERE email = 'gestionnaire@gmail.com'
ON CONFLICT (id_gestionnaire) DO NOTHING;

-- 4. Lier l'analyste
INSERT INTO analyste (id_analyste, adresse, actions)
SELECT id_utilisateur, 'Direction Générale', '["analyser_donnees","generer_rapports","faire_predictions"]'
FROM utilisateur WHERE email = 'analyste@gmail.com'
ON CONFLICT (id_analyste) DO NOTHING;

-- 5. Lier les citoyens (avec vrais quartiers)
INSERT INTO citoyen (id_citoyen, adresse, id_quartier_pref)
SELECT
    u.id_utilisateur,
    CASE
        WHEN u.email = 'feno@gmail.com' THEN 'Lot IV 123 Analakely'
        WHEN u.email = 'raforce@gmail.com' THEN 'Lot V 456 Antaninarenina'
        WHEN u.email = 'ketaka@gmail.com' THEN 'Tanambao V, Toamasina'
        ELSE 'Adresse non spécifiée'
    END,
    CASE
        WHEN u.email = 'feno@gmail.com' THEN (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Analakely' LIMIT 1)
        WHEN u.email = 'raforce@gmail.com' THEN (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Antaninarenina' LIMIT 1)
        WHEN u.email = 'ketaka@gmail.com' THEN (SELECT id_quartier FROM quartier WHERE nom_quartier = 'Tanambao V' LIMIT 1)
        ELSE NULL
    END
FROM utilisateur u
WHERE u.email IN ('feno@gmail.com', 'raforce@gmail.com', 'ketaka@gmail.com')
ON CONFLICT (id_citoyen) DO NOTHING;


-- =====================================================
-- AFFECTATION DES RÔLES PRINCIPAUX
-- =====================================================

-- Donner le rôle administrateur à l'admin
UPDATE utilisateur
SET id_role = (SELECT id_role FROM role WHERE nom_role = 'administrateur')
WHERE email = 'admin@gmail.com';

-- Donner le rôle gestionnaire au gestionnaire
UPDATE utilisateur
SET id_role = (SELECT id_role FROM role WHERE nom_role = 'gestionnaire_coupure')
WHERE email = 'gestionnaire@gmail.com';

-- Donner le rôle analyste à l'analyste
UPDATE utilisateur
SET id_role = (SELECT id_role FROM role WHERE nom_role = 'analyste')
WHERE email = 'analyste@gmail.com';

-- Vérification
SELECT u.email, r.nom_role
FROM utilisateur u
JOIN role r ON u.id_role = r.id_role
WHERE u.email IN ('admin@gmail.com', 'gestionnaire@gmail.com', 'analyste@gmail.com');
