-- ============================================================
--  Migration : ajout colonnes type_exercice + contenu
--  + insertion exercices "Décision orthographique"
-- ============================================================

-- Exercices décision orthographique

-- Niveau FACILE
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id)
VALUES (
  'Décision orthographique — Niveau 1',
  'Écoutez le mot et choisissez la bonne orthographe parmi les propositions.',
  'facile',
  'decision_orthographique',
  JSON_OBJECT(
    'mots', JSON_ARRAY(
      JSON_OBJECT('mot', 'bois',      'choix', JSON_ARRAY('bois', 'boi', 'boid')),
      JSON_OBJECT('mot', 'jour',      'choix', JSON_ARRAY('jour', 'geour', 'djour')),
      JSON_OBJECT('mot', 'chien',     'choix', JSON_ARRAY('chien', 'chiin', 'chyen')),
      JSON_OBJECT('mot', 'farine',    'choix', JSON_ARRAY('farine', 'farrine', 'pharine')),
      JSON_OBJECT('mot', 'solide',    'choix', JSON_ARRAY('solide', 'solidde', 'sollide')),
      JSON_OBJECT('mot', 'animal',    'choix', JSON_ARRAY('animal', 'annimal', 'animmal')),
      JSON_OBJECT('mot', 'bobine',    'choix', JSON_ARRAY('bobine', 'bobinne', 'bobbine')),
      JSON_OBJECT('mot', 'matin',     'choix', JSON_ARRAY('matin', 'mattin', 'maatin')),
      JSON_OBJECT('mot', 'marmite',   'choix', JSON_ARRAY('marmite', 'marmitte', 'marmittte')),
      JSON_OBJECT('mot', 'retour',    'choix', JSON_ARRAY('retour', 'retoure', 'rettour'))
    )
  ),
  '',
  NULL
);

-- Niveau MOYEN
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id)
VALUES (
  'Décision orthographique — Niveau 2',
  'Discriminez des mots orthographiquement très proches.',
  'moyen',
  'decision_orthographique',
  JSON_OBJECT(
    'mots', JSON_ARRAY(
      JSON_OBJECT('mot', 'obus',        'choix', JSON_ARRAY('abus', 'obus', 'ibus')),
      JSON_OBJECT('mot', 'ronde',       'choix', JSON_ARRAY('ronde', 'rondde', 'ronde')),
      JSON_OBJECT('mot', 'danser',      'choix', JSON_ARRAY('dancer', 'danser', 'dansser')),
      JSON_OBJECT('mot', 'regarder',    'choix', JSON_ARRAY('reugarder', 'regarder', 'regardder')),
      JSON_OBJECT('mot', 'autre',       'choix', JSON_ARRAY('otre', 'autre', 'auttre')),
      JSON_OBJECT('mot', 'enfant',      'choix', JSON_ARRAY('enfent', 'enfant', 'enffant')),
      JSON_OBJECT('mot', 'neige',       'choix', JSON_ARRAY('nège', 'neige', 'neiige')),
      JSON_OBJECT('mot', 'finir',       'choix', JSON_ARRAY('finire', 'fenir', 'finir')),
      JSON_OBJECT('mot', 'venir',       'choix', JSON_ARRAY('vennir', 'venire', 'venir')),
      JSON_OBJECT('mot', 'moustache',   'choix', JSON_ARRAY('mousthache', 'mustache', 'moustache'))
    )
  ),
  '',
  NULL
);

-- Niveau DIFFICILE
INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id)
VALUES (
  'Décision orthographique — Niveau 3',
  'Exercice avancé : consonnes doubles et graphèmes complexes.',
  'difficile',
  'decision_orthographique',
  JSON_OBJECT(
    'mots', JSON_ARRAY(
      JSON_OBJECT('mot', 'téléphoner',   'choix', JSON_ARRAY('téléphoner', 'téléfoner', 'téléfonner')),
      JSON_OBJECT('mot', 'agréable',     'choix', JSON_ARRAY('agréable', 'hagreable', 'agréeable')),
      JSON_OBJECT('mot', 'fouetter',     'choix', JSON_ARRAY('foueter', 'fouetter', 'fouêtter')),
      JSON_OBJECT('mot', 'demain',       'choix', JSON_ARRAY('demin', 'demain', 'demein')),
      JSON_OBJECT('mot', 'un cochon',    'choix', JSON_ARRAY('un cauchon', 'un cochon', 'un cocho')),
      JSON_OBJECT('mot', 'sauter',       'choix', JSON_ARRAY('saurtir', 'sautter', 'sauter')),
      JSON_OBJECT('mot', 'bijou',        'choix', JSON_ARRAY('bijjou', 'bijoux', 'bijou')),
      JSON_OBJECT('mot', 'se promener',  'choix', JSON_ARRAY('se promenner', 'se promener', 'ce promener')),
      JSON_OBJECT('mot', 'une bouchée', 'choix', JSON_ARRAY('une bouchet', 'une bouchee', 'une bouchée')),
      JSON_OBJECT('mot', 'marmite',      'choix', JSON_ARRAY('marmitte', 'marmmite', 'marmite'))
    )
  ),
  '',
  NULL
);
