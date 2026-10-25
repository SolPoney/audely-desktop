-- ================================================================
-- MIGRATION INCRÉMENTALE — 25 octobre 2026 — Notifications push
-- ================================================================
-- Web Push natif (VAPID) : pas de service tiers. Les clés VAPID vivent
-- en variables d'environnement (jamais en base ni dans le dépôt).
--
-- `endpoint` peut dépasser 255 caractères sur certains navigateurs
-- (FCM/Mozilla) : VARCHAR(500) avec un index sur préfixe (255) pour
-- rester sous la limite InnoDB tout en gardant l'unicité en pratique
-- (les débuts d'URL endpoint diffèrent toujours entre abonnements).
-- ================================================================

CREATE TABLE `AbonnementPush` (
  `id`             INT AUTO_INCREMENT,
  `id_utilisateur` INT NOT NULL,
  `endpoint`       VARCHAR(500) NOT NULL,
  `p256dh`         VARCHAR(255) NOT NULL,
  `auth`           VARCHAR(255) NOT NULL,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_endpoint` (`endpoint`(255)),
  INDEX `idx_abopush_utilisateur` (`id_utilisateur`),
  CONSTRAINT `FK_AbonnementPush_Utilisateur` FOREIGN KEY (`id_utilisateur`)
    REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `NotificationEnvoyee` (
  `id`             INT AUTO_INCREMENT,
  `id_utilisateur` INT NOT NULL,
  `variante`       VARCHAR(50) NOT NULL,
  `envoyee_le`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_utilisateur_date` (`id_utilisateur`, `envoyee_le`),
  CONSTRAINT `FK_NotificationEnvoyee_Utilisateur` FOREIGN KEY (`id_utilisateur`)
    REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
