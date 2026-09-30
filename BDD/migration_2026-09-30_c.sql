-- ================================================================
-- MIGRATION INCRÉMENTALE — 30 septembre 2026 (partie C)
-- ================================================================
-- Corrige les instructions de "Grave ou aigu" (id 1 et 18) : le texte
-- disait "Votre partenaire prononce un mot..." (conçu pour un design où
-- un partenaire humain lisait le mot), alors que depuis la correction du
-- routage grave_aigu, c'est l'application elle-même qui énonce le mot
-- via synthèse vocale avec une hauteur simulée (grave/aiguë).
--
-- On retire aussi `consigne_partenaire`, confirmé mort (jamais lu côté
-- frontend — grep -rn "consigne_partenaire" frontend/src/ ne remonte rien).
-- ================================================================

UPDATE `Exercices` SET `contenu` = '{"mots": ["chat", "maison", "soleil", "porte", "jardin", "fleur", "voiture", "nuit", "table", "musique"], "instructions": "L\'application énonce un mot avec une voix simulée, grave ou aiguë. Dites ce que vous entendez."}' WHERE `id` = 1;
UPDATE `Exercices` SET `contenu` = '{"paires": [{"mot_aigu": "oiseau", "mot_grave": "voiture"}, {"mot_aigu": "flûte", "mot_grave": "montagne"}, {"mot_aigu": "cloche", "mot_grave": "tambour"}, {"mot_aigu": "cigale", "mot_grave": "forêt"}, {"mot_aigu": "sifflet", "mot_grave": "tonnerre"}, {"mot_aigu": "grillon", "mot_grave": "camion"}, {"mot_aigu": "pipeau", "mot_grave": "orage"}, {"mot_aigu": "souris", "mot_grave": "baleine"}, {"mot_aigu": "triangle", "mot_grave": "gong"}, {"mot_aigu": "moustique", "mot_grave": "ours"}], "instructions": "L\'application énonce un mot avec une voix simulée grave ou aiguë. Dites ce que vous entendez."}' WHERE `id` = 18;
