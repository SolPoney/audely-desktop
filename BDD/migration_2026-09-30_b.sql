-- ================================================================
-- MIGRATION INCRÉMENTALE — 30 septembre 2026 (partie B)
-- ================================================================
-- Ajoute les niveaux moyen/difficile manquants pour "Grave ou aigu"
-- (le jeu de tons purs gère déjà 3 niveaux de fréquences dans le code,
-- mais seul le niveau facile existait en base).
--
-- Avant de lancer : vérifier qu'aucun exercice d'id 130/131 n'existe
-- déjà (SELECT id FROM Exercices WHERE id IN (130,131);).
-- ================================================================

INSERT INTO `Exercices` (`id`, `titre`, `niveau`, `description`, `audio_url`, `categorie_id`, `type_exercice`, `contenu`) VALUES
(130,'Grave ou aigu ? (sons rapprochés)','moyen','Écoutez le son et déterminez s\'il est grave ou aigu — les fréquences sont plus rapprochées qu\'en niveau facile.','',3,'grave_aigu',NULL),
(131,'Grave ou aigu ? (discrimination fine)','difficile','Écoutez le son et déterminez s\'il est grave ou aigu — les fréquences sont très proches, la discrimination est plus exigeante.','',3,'grave_aigu',NULL);
