-- ================================================================
-- MIGRATION INCRÉMENTALE — 30 septembre 2026
-- ================================================================
-- Corrige une race condition possible sur Revisions : deux requêtes
-- POST /api/resultats quasi simultanées pour le même (utilisateur,
-- exercice) pouvaient toutes les deux passer le SELECT avant qu'aucune
-- n'ait fait son INSERT, créant deux lignes pour la même paire — ce qui
-- fait apparaître le même exercice deux fois dans la quête du jour et
-- empêche la quête de jamais se marquer "terminée".
--
-- Avant de lancer : vérifier qu'aucun doublon n'existe déjà, sinon
-- l'ALTER TABLE échouera :
--   SELECT id_utilisateur, id_exercice, COUNT(*) FROM Revisions
--   GROUP BY id_utilisateur, id_exercice HAVING COUNT(*) > 1;
-- Si des doublons existent, les fusionner/supprimer manuellement avant
-- d'appliquer ce fichier.
-- ================================================================

ALTER TABLE Revisions
  ADD UNIQUE KEY uniq_utilisateur_exercice (id_utilisateur, id_exercice);
