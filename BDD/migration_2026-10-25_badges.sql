-- ================================================================
-- MIGRATION INCRÉMENTALE — 25 octobre 2026 — Badges persistés
-- ================================================================
-- Remplace le calcul de badges "nouvellement débloqués" (impossible à
-- détecter sans état stocké : le badge est recalculé identique à chaque
-- appel). Permet la révélation sur l'écran de fin (ResultScreen.tsx) et
-- une date d'obtention pour un futur historique.
--
-- ATTENTION : après avoir créé la table, il faut lancer le script de
-- backfill (backend/scripts/backfillBadges.ts) pour que les badges déjà
-- mérités par les utilisateurs existants soient enregistrés — sinon leur
-- prochain exercice réaffiche en "nouveau" des badges obtenus depuis
-- longtemps.
-- ================================================================

CREATE TABLE `BadgeObtenu` (
  `id_utilisateur` INT NOT NULL,
  `id_badge`       VARCHAR(50) NOT NULL,
  `obtenu_le`      DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_utilisateur`, `id_badge`),
  CONSTRAINT `FK_BadgeObtenu_Utilisateur` FOREIGN KEY (`id_utilisateur`)
    REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
