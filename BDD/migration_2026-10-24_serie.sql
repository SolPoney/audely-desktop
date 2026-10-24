-- ================================================================
-- MIGRATION INCRÉMENTALE — 24 octobre 2026 — Série stockée + gel
-- ================================================================
-- Remplace le calcul de série (streak) à la volée par une table
-- persistée, seule capable de représenter un jour manqué "couvert"
-- par un gel (pas de ligne Resultats ce jour-là, donc impossible à
-- déduire d'un simple calcul sur Resultats).
--
-- ATTENTION : après avoir créé la table, il faut lancer le script de
-- backfill (backend/scripts/backfillSerie.ts) pour initialiser la
-- série actuelle de chaque utilisateur existant à partir de son
-- historique — sinon tout le monde repart à 0 au déploiement.
-- ================================================================

CREATE TABLE IF NOT EXISTS `Serie` (
  `id_utilisateur`         INT NOT NULL,
  `serie_actuelle`         INT NOT NULL DEFAULT 0,
  `serie_record`           INT NOT NULL DEFAULT 0,
  `dernier_jour_actif`     DATE NOT NULL,
  `gels_disponibles`       TINYINT NOT NULL DEFAULT 1,
  `derniere_recharge_gel`  DATE NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  CONSTRAINT `FK_Serie_Utilisateur` FOREIGN KEY (`id_utilisateur`)
    REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
