-- ============================================================
--  Seed complet — tous les types d'exercices Audely
-- ============================================================

-- ── 1. DÉTECTER ─────────────────────────────────────────────
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Détecter les sons — Facile',    'Écoutez et cliquez chaque fois que vous entendez un son.', 'facile',    'detecter', NULL, '', NULL),
('Détecter les sons — Moyen',     'Exercice de détection sonore, rythme plus soutenu.',       'moyen',     'detecter', NULL, '', NULL),
('Détecter les sons — Difficile', 'Détection avancée : sons rapprochés et moins marqués.',   'difficile', 'detecter', NULL, '', NULL);

-- ── 2. RECONNAÎTRE LE RYTHME ────────────────────────────────
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Reconnaître le rythme — Facile',    'Reproduisez le rythme entendu en tapant le bouton.', 'facile',    'reconnaitre_rythme', NULL, '', NULL),
('Reconnaître le rythme — Moyen',     'Rythmes plus complexes à deux temps.',                'moyen',     'reconnaitre_rythme', NULL, '', NULL),
('Reconnaître le rythme — Difficile', 'Rythmes syncopés et séquences longues.',              'difficile', 'reconnaitre_rythme', NULL, '', NULL);

-- ── 3. DISTINGUER ───────────────────────────────────────────
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Distinguer les sons — Facile',    'Ces deux sons sont-ils identiques ou différents ?', 'facile',    'distinguer', NULL, '', NULL),
('Distinguer les sons — Moyen',     'Discrimination de sons proches en fréquence.',      'moyen',     'distinguer', NULL, '', NULL),
('Distinguer les sons — Difficile', 'Différences subtiles entre les sons proposés.',     'difficile', 'distinguer', NULL, '', NULL);

-- ── 4. COURT / MOYEN / LONG ─────────────────────────────────
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Court, moyen ou long — Facile',    'Identifiez la durée du son entendu.',             'facile',    'court_moyen_long', NULL, '', NULL),
('Court, moyen ou long — Moyen',     'Discrimination de durées plus proches.',           'moyen',     'court_moyen_long', NULL, '', NULL),
('Court, moyen ou long — Difficile', 'Durées très rapprochées, concentration maximale.', 'difficile', 'court_moyen_long', NULL, '', NULL);

-- ── 5. COMPRENDRE (ExercicePartenaire) ──────────────────────

-- 5a. Animaux (sons + indices) — facile
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('De quoi s\'agit-il ? — Animaux', 'Écoutez la description et trouvez l\'animal.', 'facile', 'comprendre',
JSON_OBJECT('animaux', JSON_ARRAY(
  JSON_OBJECT('animal', 'Le chien',    'indices', JSON_ARRAY('C\'est un animal domestique.', 'Il aboie.', 'Il est souvent appelé meilleur ami de l\'homme.')),
  JSON_OBJECT('animal', 'Le chat',     'indices', JSON_ARRAY('C\'est un animal domestique.', 'Il miaule.', 'Il ronronne quand on le caresse.')),
  JSON_OBJECT('animal', 'Le coq',      'indices', JSON_ARRAY('C\'est un oiseau de basse-cour.', 'Il chante le matin.', 'Il vit dans une ferme.')),
  JSON_OBJECT('animal', 'L\'éléphant', 'indices', JSON_ARRAY('C\'est le plus grand animal terrestre.', 'Il a une longue trompe.', 'Il vit en Afrique ou en Asie.')),
  JSON_OBJECT('animal', 'Le canard',   'indices', JSON_ARRAY('C\'est un oiseau aquatique.', 'Il cancane.', 'Il nage sur les étangs.'))
)), '', NULL);

-- 5b. Pareil ou différent — moyen
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Pareil ou différent ?', 'Ces deux mots sont-ils pareils ou différents ?', 'moyen', 'comprendre',
JSON_OBJECT('paires', JSON_ARRAY(
  JSON_OBJECT('mot1', 'pain',   'mot2', 'bain',   'resultat', 'different'),
  JSON_OBJECT('mot1', 'sot',    'mot2', 'seau',   'resultat', 'pareil'),
  JSON_OBJECT('mot1', 'ver',    'mot2', 'verre',  'resultat', 'pareil'),
  JSON_OBJECT('mot1', 'chat',   'mot2', 'chaud',  'resultat', 'different'),
  JSON_OBJECT('mot1', 'mère',   'mot2', 'mer',    'resultat', 'pareil'),
  JSON_OBJECT('mot1', 'cou',    'mot2', 'coup',   'resultat', 'pareil'),
  JSON_OBJECT('mot1', 'port',   'mot2', 'bord',   'resultat', 'different'),
  JSON_OBJECT('mot1', 'sol',    'mot2', 'saule',  'resultat', 'different')
)), '', NULL);

-- 5c. Compléter la phrase — moyen
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Compléter la phrase', 'Écoutez et choisissez le bon mot pour compléter la phrase.', 'moyen', 'comprendre',
JSON_OBJECT('phrases', JSON_ARRAY(
  JSON_OBJECT('phrase', 'Le matin, je bois mon ......', 'alternatives', JSON_ARRAY('café', 'cahier', 'carnet', 'câble')),
  JSON_OBJECT('phrase', 'En hiver, il fait très ......', 'alternatives', JSON_ARRAY('froid', 'beau', 'chaud', 'fond')),
  JSON_OBJECT('phrase', 'Pour écrire, j\'utilise un ......', 'alternatives', JSON_ARRAY('crayon', 'crayon', 'crouton', 'carton')),
  JSON_OBJECT('phrase', 'Le soleil brille dans le ......', 'alternatives', JSON_ARRAY('ciel', 'cil', 'selle', 'sel')),
  JSON_OBJECT('phrase', 'Les enfants jouent dans le ......', 'alternatives', JSON_ARRAY('parc', 'pare', 'bar', 'par')),
  JSON_OBJECT('phrase', 'La nuit, on voit les ......', 'alternatives', JSON_ARRAY('étoiles', 'étoles', 'toiles', 'tôles'))
)), '', NULL);

-- 5d. Voyelles — facile
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Quelle voyelle ?', 'Écoutez et identifiez la voyelle entendue.', 'facile', 'comprendre',
JSON_OBJECT('voyelles', JSON_ARRAY('a', 'e', 'i', 'o', 'u', 'ou', 'an', 'on', 'in')),
'', NULL);

-- 5e. Mots courts / longs — moyen
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Mot court ou long ?', 'Ce mot est-il court ou long ?', 'moyen', 'court_moyen_long',
JSON_OBJECT('mots', JSON_ARRAY(
  JSON_OBJECT('mot', 'chat',          'type', 'court'),
  JSON_OBJECT('mot', 'extraordinaire','type', 'long'),
  JSON_OBJECT('mot', 'sol',           'type', 'court'),
  JSON_OBJECT('mot', 'bibliothèque',  'type', 'long'),
  JSON_OBJECT('mot', 'eau',           'type', 'court'),
  JSON_OBJECT('mot', 'automobile',    'type', 'long'),
  JSON_OBJECT('mot', 'nuit',          'type', 'court'),
  JSON_OBJECT('mot', 'gouvernement',  'type', 'long')
)), '', NULL);

-- 5f. Groupes de mots proches — difficile
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id) VALUES
('Quel mot avez-vous entendu ?', 'Parmi ces mots proches, lequel a été prononcé ?', 'difficile', 'comprendre',
JSON_OBJECT('groupes', JSON_ARRAY(
  JSON_ARRAY('bal', 'mal', 'cal', 'pal'),
  JSON_ARRAY('son', 'bon', 'ton', 'don'),
  JSON_ARRAY('fée', 'thé', 'clé', 'né'),
  JSON_ARRAY('jour', 'tour', 'pour', 'four'),
  JSON_ARRAY('sac', 'lac', 'bac', 'tac'),
  JSON_ARRAY('fil', 'mil', 'nil', 'vil'),
  JSON_ARRAY('mer', 'fer', 'vert', 'nerf'),
  JSON_ARRAY('bol', 'col', 'vol', 'sol')
)), '', NULL);
