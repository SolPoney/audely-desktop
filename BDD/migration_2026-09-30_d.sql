-- ================================================================
-- MIGRATION INCRÉMENTALE — 30 septembre 2026 (partie D)
-- ================================================================
-- Corrige 5 exercices "Détecter" / "Court ou long" dont le contenu JSON
-- riche était orphelin : le routage front (ExercicePage.tsx) ne
-- reconnaissait pas leur forme de contenu et les envoyait vers le
-- mini-jeu générique (bips/tons), exactement comme le bug déjà corrigé
-- sur "Distinguer" et "Grave ou aigu".
--
--   id 2  "Repérer le son"          (mots + son_cible)      → detecter
--   id 5  "1 ou 2 sons ?"           (series)                → detecter
--   id 13 "Son fort ou faible ?"    (phrases string[])      → detecter
--   id 36 "Court ou très long ?"    (paires mots/syllabes)  → court_moyen_long
--   id 39 "Quelle fin de phrase ?"  (phrases {debut,fins})  → court_moyen_long
--
-- Le texte "Votre partenaire..." est aussi corrigé pour id 5/13/36/39 :
-- avec le routage réparé, c'est l'application (TTS) qui énonce le
-- contenu, plus un partenaire humain.
-- ================================================================

UPDATE `Exercices` SET `contenu` = '{"mots": ["soleil", "maison", "chat", "sac", "porte", "saison", "table", "son", "forêt", "semaine", "lumière", "soir"], "son_cible": "S", "instructions": "Écoutez chaque mot et dites s\'il contient le son cible."}' WHERE `id` = 2;
UPDATE `Exercices` SET `contenu` = '{"series": [{"sons": 1}, {"sons": 2}, {"sons": 1}, {"sons": 2}, {"sons": 2}, {"sons": 1}, {"sons": 2}, {"sons": 1}, {"sons": 1}, {"sons": 2}], "instructions": "L\'application produit un ou deux sons. Dites combien vous en entendez."}' WHERE `id` = 5;
UPDATE `Exercices` SET `contenu` = '{"phrases": ["Bonjour, comment allez-vous ?", "Il fait beau aujourd\'hui.", "J\'ai faim, allons manger.", "La porte est ouverte.", "C\'est l\'heure du dîner.", "Le train part dans cinq minutes."], "instructions": "L\'application énonce une phrase avec un volume simulé, fort ou doucement. Identifiez l\'intensité."}' WHERE `id` = 13;
UPDATE `Exercices` SET `contenu` = '{"paires": [{"mots": ["chat", "bibliothèque"], "syllabes": [1, 5]}, {"mots": ["nuit", "extraordinaire"], "syllabes": [1, 6]}, {"mots": ["pain", "communication"], "syllabes": [1, 5]}, {"mots": ["fleur", "magnifiquement"], "syllabes": [1, 5]}, {"mots": ["mer", "responsabilité"], "syllabes": [1, 6]}, {"mots": ["bois", "réconciliation"], "syllabes": [1, 6]}, {"mots": ["thé", "vraisemblablement"], "syllabes": [1, 6]}, {"mots": ["sol", "individualité"], "syllabes": [1, 6]}, {"mots": ["mur", "incompréhensible"], "syllabes": [1, 6]}, {"mots": ["rue", "internationalisation"], "syllabes": [1, 8]}], "instructions": "L\'application énonce l\'un des deux mots. Dites lequel vous avez entendu."}' WHERE `id` = 36;
UPDATE `Exercices` SET `contenu` = '{"phrases": [{"debut": "Ce matin, j\'ai mangé…", "fins": ["du pain.", "des céréales avec du lait.", "un croissant au beurre accompagné d\'un café chaud."]}, {"debut": "Pour les vacances, nous partons…", "fins": ["en mer.", "à la montagne.", "découvrir les paysages magnifiques de la Bretagne."]}, {"debut": "Hier soir, il a regardé…", "fins": ["la télé.", "un documentaire.", "un long film historique sur la Révolution française."]}, {"debut": "Elle travaille…", "fins": ["là-bas.", "à l\'hôpital.", "dans un grand cabinet d\'avocat au centre-ville."]}, {"debut": "Mon voisin a acheté…", "fins": ["une voiture.", "un appartement.", "une belle maison avec jardin et piscine dans le sud de la France."]}], "instructions": "L\'application énonce la fin de la phrase. Les options ont des longueurs très différentes — identifiez celle que vous avez entendue."}' WHERE `id` = 39;
