-- ================================================================
-- MIGRATION INCRÉMENTALE — 24 octobre 2026 — Journal XP + onboarding
-- ================================================================
-- Remplace le calcul d'XP total à la volée par un journal persisté
-- (GainXP), seul moyen de calculer l'XP du jour (objectif quotidien) et
-- de préparer les ligues hebdomadaires (item 9 du plan) sans tout
-- recalculer depuis Resultats à chaque fois.
--
-- ATTENTION : après avoir créé la table, il faut lancer le script de
-- backfill (backend/scripts/backfillGainXP.ts) pour que le total XP
-- affiché ne change pas au déploiement (une ligne GainXP par résultat
-- historique, avec la même formule que l'ancien calcul).
-- ================================================================

ALTER TABLE `Utilisateur`
  ADD COLUMN `objectif_quotidien_xp` INT NOT NULL DEFAULT 30,
  ADD COLUMN `onboarding_fait` TINYINT(1) NOT NULL DEFAULT 0;

-- Les comptes déjà existants n'ont pas besoin de revoir l'écran
-- d'onboarding (qui n'existait pas avant) — seuls les nouveaux
-- inscrits à partir de maintenant le verront.
UPDATE `Utilisateur` SET `onboarding_fait` = 1;

CREATE TABLE `GainXP` (
  `id`             INT AUTO_INCREMENT,
  `id_utilisateur` INT NOT NULL,
  `source`         ENUM('exercice','bonus_score','revision','quete','bonus_serie','combo') NOT NULL,
  `montant`        INT NOT NULL,
  `id_resultat`    INT DEFAULT NULL,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_gainxp_utilisateur_date` (`id_utilisateur`, `created_at`),
  CONSTRAINT `FK_GainXP_Utilisateur` FOREIGN KEY (`id_utilisateur`)
    REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_GainXP_Resultats` FOREIGN KEY (`id_resultat`)
    REFERENCES `Resultats`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
