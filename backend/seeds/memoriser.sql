-- Exercices Mémoriser (categorie_id = 7)

INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id)
VALUES (
  'Retenir les détails',
  'Écoutez l histoire puis répondez aux questions.',
  'facile',
  'comprendre',
  JSON_OBJECT(
    'histoires', JSON_ARRAY(
      JSON_OBJECT(
        'titre', 'Le chat et la souris',
        'texte', 'Un petit chat roux vit dans une maison bleue. Il aime jouer avec une balle rouge. Un jour, il rencontre une souris grise dans le jardin.',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'De quelle couleur est le chat ?', 'reponse', 'roux', 'choix', JSON_ARRAY('noir', 'roux', 'blanc')),
          JSON_OBJECT('question', 'De quelle couleur est la maison ?', 'reponse', 'bleue', 'choix', JSON_ARRAY('rouge', 'verte', 'bleue')),
          JSON_OBJECT('question', 'Ou se passe la rencontre ?', 'reponse', 'dans le jardin', 'choix', JSON_ARRAY('dans la maison', 'dans le jardin', 'dans la rue'))
        )
      )
    )
  ),
  '',
  7
);

INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id)
VALUES (
  'Une journée à la mer',
  'Écoutez et retenez les détails de cette journée.',
  'moyen',
  'comprendre',
  JSON_OBJECT(
    'histoires', JSON_ARRAY(
      JSON_OBJECT(
        'titre', 'La journée de Marie',
        'texte', 'Marie part à la mer avec son frère Paul et sa grand-mère. Ils arrivent à dix heures du matin. Marie mange une glace à la fraise, Paul préfère le chocolat. Le soir ils rentrent fatigués mais heureux.',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'Avec qui Marie va-t-elle à la mer ?', 'reponse', 'son frère et sa grand-mère', 'choix', JSON_ARRAY('ses parents', 'son frère et sa grand-mère', 'ses amis')),
          JSON_OBJECT('question', 'À quelle heure arrivent-ils ?', 'reponse', 'dix heures', 'choix', JSON_ARRAY('neuf heures', 'dix heures', 'onze heures')),
          JSON_OBJECT('question', 'Quel parfum choisit Marie ?', 'reponse', 'fraise', 'choix', JSON_ARRAY('chocolat', 'vanille', 'fraise')),
          JSON_OBJECT('question', 'Comment se sentent-ils le soir ?', 'reponse', 'fatigués mais heureux', 'choix', JSON_ARRAY('tristes', 'fatigués mais heureux', 'en pleine forme'))
        )
      )
    )
  ),
  '',
  7
);

INSERT INTO Exercices (titre, description, niveau, type_exercice, contenu, audio_url, categorie_id)
VALUES (
  'Le marché du dimanche',
  'Retenez les détails de cette scène.',
  'difficile',
  'comprendre',
  JSON_OBJECT(
    'histoires', JSON_ARRAY(
      JSON_OBJECT(
        'titre', 'Au marché',
        'texte', 'Chaque dimanche matin, monsieur Dupont se rend au marché du village. Il achète deux kilos de tomates, puis un bouquet de roses jaunes pour sa femme. Il croise son voisin Bernard qui lui parle de son chien malade. En rentrant il achète une baguette et quatre croissants.',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'Quand monsieur Dupont va-t-il au marché ?', 'reponse', 'le dimanche matin', 'choix', JSON_ARRAY('le samedi matin', 'le dimanche matin', 'tous les jours')),
          JSON_OBJECT('question', 'Combien de kilos de tomates achète-t-il ?', 'reponse', 'deux kilos', 'choix', JSON_ARRAY('un kilo', 'deux kilos', 'trois kilos')),
          JSON_OBJECT('question', 'De quelle couleur sont les roses ?', 'reponse', 'jaunes', 'choix', JSON_ARRAY('rouges', 'blanches', 'jaunes')),
          JSON_OBJECT('question', 'De quoi parle le voisin ?', 'reponse', 'de son chien malade', 'choix', JSON_ARRAY('de son jardin', 'de son chien malade', 'de la météo')),
          JSON_OBJECT('question', 'Combien de croissants achète-t-il ?', 'reponse', 'quatre', 'choix', JSON_ARRAY('deux', 'trois', 'quatre'))
        )
      )
    )
  ),
  '',
  7
);
