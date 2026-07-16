-- =======================================================
-- SEEDS AUDELY — à exécuter UNE FOIS sur la base existante
-- =======================================================

-- 1. Ajout de la colonne type_exercice
ALTER TABLE Exercices
ADD COLUMN type_exercice ENUM('detecter', 'reconnaitre') NOT NULL DEFAULT 'detecter';

-- 2. Catégories
INSERT INTO Categorie (titre) VALUES
  ('Détecter'),
  ('Reconnaître');

-- 3. Exercices
--    Catégorie 1 = Détecter, Catégorie 2 = Reconnaître
--    audio_url : placez vos fichiers dans frontend/public/audio/
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  (
    'Repérer le son',
    'facile',
    'Écoutez l''enregistrement et cliquez chaque fois que vous entendez un son.',
    '/audio/reperer-son.mp3',
    1,
    'detecter'
  ),
  (
    'Son grave ou aigu',
    'facile',
    'Écoutez et déterminez si le son est grave ou aigu.',
    '/audio/grave-aigu.mp3',
    1,
    'detecter'
  ),
  (
    'Son court ou long',
    'moyen',
    'Écoutez et déterminez si la durée du son est courte ou longue.',
    '/audio/duree-son.mp3',
    1,
    'detecter'
  ),
  (
    '1 ou 2 sons ?',
    'moyen',
    'Combien de sons distincts entendez-vous dans cet extrait ?',
    '/audio/un-ou-deux.mp3',
    1,
    'detecter'
  ),
  (
    'Reconnaître un animal',
    'facile',
    'Quel animal entendez-vous dans cet enregistrement ?',
    '/audio/animal.mp3',
    2,
    'reconnaitre'
  ),
  (
    'Reconnaître un instrument',
    'facile',
    'Quel instrument de musique est joué dans cet extrait ?',
    '/audio/instrument.mp3',
    2,
    'reconnaitre'
  ),
  (
    'Reconnaître une voyelle',
    'moyen',
    'Quelle voyelle a été prononcée ?',
    '/audio/voyelle.mp3',
    2,
    'reconnaitre'
  ),
  (
    'Reconnaître une émotion',
    'difficile',
    'Quelle émotion exprime cette voix ?',
    '/audio/emotion.mp3',
    2,
    'reconnaitre'
  );
