-- =======================================================
-- MIGRATION V3 — Contenu original en français
-- Inspiré des formats Cochlear, contenu 100% original
-- 1. Ajouter colonne contenu JSON
-- 2. Insérer les exercices avec leur contenu
-- =======================================================

-- 1. Ajout de la colonne contenu
ALTER TABLE Exercices ADD COLUMN contenu JSON NULL;


-- =======================================================
-- CATÉGORIE 3 — DÉTECTER
-- Format inspiré : comptage de syllabes, détection de sons
-- =======================================================

INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Court ou long ?',
  'facile',
  'Écoutez chaque son et dites s''il est court ou long.',
  '',
  3,
  'detecter',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce un mot. Dites si ce mot est court (1-2 syllabes) ou long (3 syllabes ou plus).',
    'consigne_partenaire', 'Prononcez chaque mot clairement. Attendez la réponse avant de continuer.',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mot', 'chat', 'syllabes', 1, 'type', 'court'),
      JSON_OBJECT('mot', 'maison', 'syllabes', 2, 'type', 'court'),
      JSON_OBJECT('mot', 'bibliothèque', 'syllabes', 5, 'type', 'long'),
      JSON_OBJECT('mot', 'soleil', 'syllabes', 2, 'type', 'court'),
      JSON_OBJECT('mot', 'papillon', 'syllabes', 3, 'type', 'long'),
      JSON_OBJECT('mot', 'pain', 'syllabes', 1, 'type', 'court'),
      JSON_OBJECT('mot', 'anniversaire', 'syllabes', 5, 'type', 'long'),
      JSON_OBJECT('mot', 'porte', 'syllabes', 1, 'type', 'court'),
      JSON_OBJECT('mot', 'téléphone', 'syllabes', 3, 'type', 'long'),
      JSON_OBJECT('mot', 'fleur', 'syllabes', 1, 'type', 'court'),
      JSON_OBJECT('mot', 'ordinateur', 'syllabes', 5, 'type', 'long'),
      JSON_OBJECT('mot', 'eau', 'syllabes', 1, 'type', 'court')
    )
  )
),
(
  'Combien de syllabes ?',
  'moyen',
  'Comptez le nombre de syllabes dans chaque mot entendu.',
  '',
  3,
  'detecter',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce un mot. Comptez le nombre de syllabes et répondez.',
    'consigne_partenaire', 'Prononcez le mot naturellement, sans exagérer les syllabes.',
    'mots', JSON_ARRAY(
      JSON_OBJECT('mot', 'table', 'syllabes', 2),
      JSON_OBJECT('mot', 'jardin', 'syllabes', 2),
      JSON_OBJECT('mot', 'médecin', 'syllabes', 3),
      JSON_OBJECT('mot', 'nuit', 'syllabes', 1),
      JSON_OBJECT('mot', 'hôpital', 'syllabes', 4),
      JSON_OBJECT('mot', 'rue', 'syllabes', 1),
      JSON_OBJECT('mot', 'aventure', 'syllabes', 3),
      JSON_OBJECT('mot', 'boulangerie', 'syllabes', 5),
      JSON_OBJECT('mot', 'voix', 'syllabes', 1),
      JSON_OBJECT('mot', 'musique', 'syllabes', 3),
      JSON_OBJECT('mot', 'conversation', 'syllabes', 5),
      JSON_OBJECT('mot', 'lit', 'syllabes', 1)
    )
  )
),
(
  'Fort ou doux ?',
  'facile',
  'Dites si le son entendu est fort ou doux.',
  '',
  3,
  'detecter',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce chaque phrase soit fort soit doucement. Identifiez l''intensité.',
    'consigne_partenaire', 'Lisez chaque phrase en alternant fort et doucement, dans un ordre aléatoire.',
    'phrases', JSON_ARRAY(
      'Bonjour, comment allez-vous ?',
      'Il fait beau aujourd''hui.',
      'J''ai faim, allons manger.',
      'La porte est ouverte.',
      'C''est l''heure du dîner.',
      'Le train part dans cinq minutes.'
    )
  )
),
(
  '1 ou 2 sons ?',
  'difficile',
  'Dites si vous entendez un ou deux sons distincts.',
  '',
  3,
  'detecter',
  JSON_OBJECT(
    'instructions', 'Votre partenaire produit soit un son, soit deux sons à la suite. Dites combien vous en entendez.',
    'consigne_partenaire', 'Frappez dans vos mains une ou deux fois, en faisant une courte pause entre les deux sons si nécessaire.',
    'series', JSON_ARRAY(
      JSON_OBJECT('sons', 1),
      JSON_OBJECT('sons', 2),
      JSON_OBJECT('sons', 1),
      JSON_OBJECT('sons', 2),
      JSON_OBJECT('sons', 2),
      JSON_OBJECT('sons', 1),
      JSON_OBJECT('sons', 2),
      JSON_OBJECT('sons', 1),
      JSON_OBJECT('sons', 1),
      JSON_OBJECT('sons', 2)
    )
  )
);


-- =======================================================
-- CATÉGORIE 4 — RECONNAÎTRE
-- Format inspiré : identifier des mots dans leur contexte
-- =======================================================

INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Reconnaître un son du quotidien',
  'facile',
  'Identifiez le son décrit par votre partenaire.',
  '',
  4,
  'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire décrit un son sans le nommer. Devinez de quel son il s''agit.',
    'consigne_partenaire', 'Décrivez le son avec des mots, sans le nommer directement. Ex : "C''est le bruit d''un liquide qui coule".',
    'sons', JSON_ARRAY(
      JSON_OBJECT('son', 'La pluie', 'description', 'C''est un bruit continu de gouttes qui tombent du ciel sur les vitres'),
      JSON_OBJECT('son', 'La sonnerie du téléphone', 'description', 'C''est un son répétitif qui vous appelle à répondre'),
      JSON_OBJECT('son', 'Le four à micro-ondes', 'description', 'C''est un bip court qui annonce que votre plat est chaud'),
      JSON_OBJECT('son', 'Un chien qui aboie', 'description', 'C''est le cri d''un animal domestique qui surveille la maison'),
      JSON_OBJECT('son', 'La cafetière', 'description', 'C''est un gargouillis régulier qui prépare votre boisson du matin'),
      JSON_OBJECT('son', 'Une clé dans la serrure', 'description', 'C''est un bruit métallique suivi d''un clic quand on entre chez soi')
    )
  )
),
(
  'Quel instrument joue ?',
  'facile',
  'Reconnaissez l''instrument décrit.',
  '',
  4,
  'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire décrit un instrument de musique. Nommez-le.',
    'consigne_partenaire', 'Décrivez l''instrument sans le nommer : son apparence, comment on en joue, quel type de musique.',
    'instruments', JSON_ARRAY(
      JSON_OBJECT('instrument', 'Le piano', 'indices', JSON_ARRAY('On appuie sur des touches noires et blanches', 'Il peut être très grand ou très petit', 'Beethoven en jouait')),
      JSON_OBJECT('instrument', 'La guitare', 'indices', JSON_ARRAY('On pince des cordes tendues sur un manche', 'On peut en jouer assis', 'Très utilisée en rock et en flamenco')),
      JSON_OBJECT('instrument', 'Le violon', 'indices', JSON_ARRAY('On le tient sous le menton', 'On utilise un archet pour le faire sonner', 'C''est un instrument à cordes frottées')),
      JSON_OBJECT('instrument', 'La flûte', 'indices', JSON_ARRAY('On souffle dedans', 'C''est un tube long et fin', 'Elle produit des sons aigus et clairs')),
      JSON_OBJECT('instrument', 'La batterie', 'indices', JSON_ARRAY('On le frappe avec des baguettes', 'Il donne le rythme au groupe', 'Il est composé de plusieurs tambours'))
    )
  )
),
(
  'Reconnaître une voyelle',
  'moyen',
  'Identifiez la voyelle prononcée.',
  '',
  4,
  'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce une voyelle isolée. Identifiez laquelle.',
    'consigne_partenaire', 'Prononcez chaque voyelle clairement et de façon isolée, sans indice visuel si possible.',
    'voyelles', JSON_ARRAY('A', 'E', 'I', 'O', 'U', 'OU', 'AN', 'ON', 'IN', 'EU'),
    'ordre_aleatoire', true
  )
),
(
  'Reconnaître une émotion dans la voix',
  'difficile',
  'Identifiez l''émotion exprimée dans la phrase.',
  '',
  4,
  'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit la même phrase avec différentes émotions. Identifiez l''émotion à chaque fois.',
    'consigne_partenaire', 'Lisez toujours la même phrase mais avec l''émotion indiquée. Ne dites pas l''émotion.',
    'phrase_support', 'Je vais aller faire les courses cet après-midi.',
    'emotions', JSON_ARRAY('joie', 'tristesse', 'colère', 'surprise', 'peur', 'ennui', 'enthousiasme')
  )
);


-- =======================================================
-- CATÉGORIE 5 — DISTINGUER
-- Format inspiré : discrimination de sons proches
-- =======================================================

INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Pareil ou différent ?',
  'facile',
  'Dites si les deux mots entendus sont identiques ou différents.',
  '',
  5,
  'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce deux mots. Dites s''ils sont pareils ou différents.',
    'consigne_partenaire', 'Prononcez les deux mots l''un après l''autre avec une courte pause. Certaines paires sont identiques.',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mot1', 'pain', 'mot2', 'bain', 'resultat', 'différent'),
      JSON_OBJECT('mot1', 'sou', 'mot2', 'sou', 'resultat', 'pareil'),
      JSON_OBJECT('mot1', 'chat', 'mot2', 'gat', 'resultat', 'différent'),
      JSON_OBJECT('mot1', 'mer', 'mot2', 'mer', 'resultat', 'pareil'),
      JSON_OBJECT('mot1', 'vert', 'mot2', 'fer', 'resultat', 'différent'),
      JSON_OBJECT('mot1', 'tôt', 'mot2', 'tôt', 'resultat', 'pareil'),
      JSON_OBJECT('mot1', 'vin', 'mot2', 'lin', 'resultat', 'différent'),
      JSON_OBJECT('mot1', 'pont', 'mot2', 'bond', 'resultat', 'différent'),
      JSON_OBJECT('mot1', 'rue', 'mot2', 'rue', 'resultat', 'pareil'),
      JSON_OBJECT('mot1', 'cou', 'mot2', 'genou', 'resultat', 'différent')
    )
  )
),
(
  'Grave ou aigu ?',
  'facile',
  'Distinguez les sons graves des sons aigus.',
  '',
  5,
  'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce deux mots. Lequel a la voix la plus grave ? Lequel a la voix la plus aiguë ?',
    'consigne_partenaire', 'Prononcez les deux mots, l''un avec une voix grave, l''autre avec une voix aiguë, dans un ordre aléatoire.',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mot_grave', 'voiture', 'mot_aigu', 'oiseau'),
      JSON_OBJECT('mot_grave', 'montagne', 'mot_aigu', 'flûte'),
      JSON_OBJECT('mot_grave', 'tambour', 'mot_aigu', 'cloche'),
      JSON_OBJECT('mot_grave', 'forêt', 'mot_aigu', 'cigale'),
      JSON_OBJECT('mot_grave', 'tonnerre', 'mot_aigu', 'sifflet')
    )
  )
),
(
  'Syllabes proches',
  'moyen',
  'Identifiez la syllabe prononcée parmi deux options très proches.',
  '',
  5,
  'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire prononce une syllabe. Dites laquelle vous avez entendue.',
    'consigne_partenaire', 'Prononcez la syllabe clairement, sans exagérer, dans un ordre aléatoire.',
    'paires', JSON_ARRAY(
      JSON_ARRAY('pa', 'ba'),
      JSON_ARRAY('ta', 'da'),
      JSON_ARRAY('ka', 'ga'),
      JSON_ARRAY('fa', 'va'),
      JSON_ARRAY('sa', 'za'),
      JSON_ARRAY('si', 'zi'),
      JSON_ARRAY('po', 'bo'),
      JSON_ARRAY('tu', 'du'),
      JSON_ARRAY('fi', 'vi'),
      JSON_ARRAY('chou', 'joue')
    )
  )
),
(
  'Quel mot a été dit ?',
  'moyen',
  'Identifiez le mot parmi une liste de mots phonétiquement proches.',
  '',
  5,
  'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire choisit et prononce un des mots de chaque groupe. Identifiez lequel.',
    'consigne_partenaire', 'Pour chaque groupe, choisissez un mot au hasard et prononcez-le naturellement.',
    'groupes', JSON_ARRAY(
      JSON_ARRAY('mer', 'mère', 'maire', 'mais'),
      JSON_ARRAY('son', 'sans', 'sang', 'cent'),
      JSON_ARRAY('vert', 'ver', 'verre', 'vers'),
      JSON_ARRAY('pain', 'pin', 'bain', 'bien'),
      JSON_ARRAY('sot', 'seau', 'sceau', 'saut'),
      JSON_ARRAY('cou', 'coût', 'coup', 'queue'),
      JSON_ARRAY('saint', 'sain', 'sein', 'cinq')
    )
  )
),
(
  'Quelle phrase a été dite ?',
  'difficile',
  'Distinguez deux phrases très proches phonétiquement.',
  '',
  5,
  'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit une des deux phrases. Identifiez laquelle.',
    'consigne_partenaire', 'Lisez la phrase choisie naturellement, sans indice visuel.',
    'paires', JSON_ARRAY(
      JSON_ARRAY('Le chat mange la souris.', 'Le chien mange la saucisse.'),
      JSON_ARRAY('Il part demain matin.', 'Il part domain matin.'),
      JSON_ARRAY('Elle porte un manteau vert.', 'Elle porte un chapeau vert.'),
      JSON_ARRAY('Je voudrais du pain.', 'Je voudrais du bain.'),
      JSON_ARRAY('La voiture est garée dehors.', 'La voiture est carrée dehors.'),
      JSON_ARRAY('Il fait froid ce soir.', 'Il fait chaud ce soir.')
    )
  )
);


-- =======================================================
-- CATÉGORIE 6 — COMPRENDRE
-- Format inspiré : compléter la phrase, contexte, scénario
-- =======================================================

INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Complétez la phrase',
  'facile',
  'Votre partenaire lit une phrase avec un mot manquant. Identifiez le mot prononcé.',
  '',
  6,
  'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous donne la liste des mots possibles, puis lit la phrase en choisissant l''un d''eux. Dites lequel a été prononcé.',
    'consigne_partenaire', 'Montrez la liste de mots à l''auditeur. Lisez la phrase complète en choisissant un mot au hasard. Ne montrez pas quel mot vous avez choisi.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('phrase', 'Ce matin, j''ai bu mon ...... chaud.', 'alternatives', JSON_ARRAY('café', 'thé', 'lait', 'chocolat'), 'reponse_exemple', 'café'),
      JSON_OBJECT('phrase', 'Il fait froid, prends ton ......', 'alternatives', JSON_ARRAY('manteau', 'chapeau', 'parapluie'), 'reponse_exemple', 'manteau'),
      JSON_OBJECT('phrase', 'J''ai lu un bon ...... ce week-end.', 'alternatives', JSON_ARRAY('livre', 'journal', 'magazine'), 'reponse_exemple', 'livre'),
      JSON_OBJECT('phrase', 'On mange à quelle ...... ce soir ?', 'alternatives', JSON_ARRAY('heure', 'table', 'place'), 'reponse_exemple', 'heure'),
      JSON_OBJECT('phrase', 'Le médecin m''a donné une ......', 'alternatives', JSON_ARRAY('ordonnance', 'pilule', 'piqûre'), 'reponse_exemple', 'ordonnance'),
      JSON_OBJECT('phrase', 'J''ai acheté du ...... à la boulangerie.', 'alternatives', JSON_ARRAY('pain', 'croissant', 'gâteau'), 'reponse_exemple', 'pain'),
      JSON_OBJECT('phrase', 'Le train part de quel ...... ?', 'alternatives', JSON_ARRAY('quai', 'billet', 'wagon'), 'reponse_exemple', 'quai'),
      JSON_OBJECT('phrase', 'Peux-tu ouvrir la ...... s''il te plaît ?', 'alternatives', JSON_ARRAY('fenêtre', 'porte', 'boîte'), 'reponse_exemple', 'fenêtre'),
      JSON_OBJECT('phrase', 'J''ai oublié mon ...... à la maison.', 'alternatives', JSON_ARRAY('téléphone', 'portefeuille', 'trousseau'), 'reponse_exemple', 'téléphone'),
      JSON_OBJECT('phrase', 'Elle travaille à l''...... depuis dix ans.', 'alternatives', JSON_ARRAY('hôpital', 'école', 'université'), 'reponse_exemple', 'hôpital'),
      JSON_OBJECT('phrase', 'On a regardé un bon ...... hier soir.', 'alternatives', JSON_ARRAY('film', 'match', 'spectacle'), 'reponse_exemple', 'film'),
      JSON_OBJECT('phrase', 'Le ...... est rouge ce soir, il fera beau demain.', 'alternatives', JSON_ARRAY('ciel', 'soleil', 'nuage'), 'reponse_exemple', 'ciel')
    )
  )
),
(
  'Le bon contexte',
  'moyen',
  'Utilisez le contexte de la phrase pour trouver le mot manquant.',
  '',
  6,
  'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit une phrase avec un mot clé prononcé. Grâce au contexte, identifiez ce mot parmi les alternatives.',
    'consigne_partenaire', 'Lisez la phrase entière. L''auditeur doit utiliser le sens de la phrase pour identifier le mot prononcé.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('phrase', 'J''avais très froid, alors j''ai allumé le ......', 'alternatives', JSON_ARRAY('chauffage', 'ventilateur', 'climatiseur'), 'reponse', 'chauffage'),
      JSON_OBJECT('phrase', 'Elle était fatiguée, elle s''est couchée dès vingt heures, sans regarder la ......', 'alternatives', JSON_ARRAY('télévision', 'fenêtre', 'montre'), 'reponse', 'télévision'),
      JSON_OBJECT('phrase', 'Il avait oublié son parapluie et il est rentré complètement ......', 'alternatives', JSON_ARRAY('trempé', 'bronzé', 'fatigué'), 'reponse', 'trempé'),
      JSON_OBJECT('phrase', 'Le gâteau était brûlé car elle l''avait laissé trop longtemps dans le ......', 'alternatives', JSON_ARRAY('four', 'congélateur', 'frigo'), 'reponse', 'four'),
      JSON_OBJECT('phrase', 'Il avait perdu ses clés et n''a pas pu entrer dans sa ......', 'alternatives', JSON_ARRAY('maison', 'voiture', 'valise'), 'reponse', 'maison')
    )
  )
),
(
  'Phrases sur un sujet',
  'moyen',
  'Écoutez des phrases sur un même sujet et répétez-les.',
  '',
  6,
  'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire révèle le thème, puis lit une phrase à la fois. Répétez chaque phrase après l''avoir entendue.',
    'consigne_partenaire', 'Annoncez le thème. Lisez chaque phrase lentement et naturellement. Attendez que l''auditeur répète avant de continuer.',
    'themes', JSON_ARRAY(
      JSON_OBJECT(
        'theme', 'La cuisine',
        'phrases', JSON_ARRAY(
          'Qu''est-ce qu''on mange ce soir ?',
          'Le repas est prêt, tu peux venir.',
          'J''ai fait une tarte aux pommes.',
          'Tu veux encore de la soupe ?',
          'La recette demande deux œufs.',
          'Je mets la table pour quatre personnes.'
        )
      ),
      JSON_OBJECT(
        'theme', 'La santé',
        'phrases', JSON_ARRAY(
          'Je n''ai pas bien dormi cette nuit.',
          'J''ai un rendez-vous chez le médecin.',
          'Il faut prendre ce médicament deux fois par jour.',
          'Comment vous sentez-vous aujourd''hui ?',
          'Je me sens beaucoup mieux, merci.',
          'Il faut boire suffisamment d''eau.'
        )
      ),
      JSON_OBJECT(
        'theme', 'Les transports',
        'phrases', JSON_ARRAY(
          'Le bus a du retard ce matin.',
          'À quelle heure part le prochain train ?',
          'Il faut composter son billet avant de monter.',
          'Il y a des embouteillages sur l''autoroute.',
          'Je préfère prendre le vélo par beau temps.',
          'L''avion atterrit dans vingt minutes.'
        )
      ),
      JSON_OBJECT(
        'theme', 'Les courses',
        'phrases', JSON_ARRAY(
          'J''ai besoin de pain et de lait.',
          'Le supermarché ferme à vingt heures.',
          'Tu as la liste de courses ?',
          'Les tomates sont en promotion aujourd''hui.',
          'Je cherche le rayon des produits laitiers.',
          'Il ne reste plus de farine, j''en achète ?'
        )
      )
    )
  )
),
(
  'Questions et réponses',
  'difficile',
  'Répondez aux questions posées par votre partenaire.',
  '',
  6,
  'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous pose des questions. Répondez le plus naturellement possible. Si vous n''avez pas compris, demandez de répéter.',
    'consigne_partenaire', 'Posez chaque question clairement. Si l''auditeur ne comprend pas après deux essais, reformulez avec d''autres mots.',
    'themes', JSON_ARRAY(
      JSON_OBJECT(
        'theme', 'La journée',
        'questions', JSON_ARRAY(
          'À quelle heure vous levez-vous en général ?',
          'Qu''est-ce que vous mangez au petit-déjeuner ?',
          'Comment venez-vous ici ce matin ?',
          'Avez-vous bien dormi cette nuit ?',
          'Qu''avez-vous fait hier soir ?'
        )
      ),
      JSON_OBJECT(
        'theme', 'Les loisirs',
        'questions', JSON_ARRAY(
          'Qu''aimez-vous faire le week-end ?',
          'Regardez-vous souvent la télévision ?',
          'Avez-vous un sport préféré ?',
          'Lisez-vous beaucoup ?',
          'Aimez-vous la musique ?'
        )
      )
    )
  )
);


-- =======================================================
-- CATÉGORIE 7 — MÉMORISER
-- Format inspiré : listes, histoires, rappel différé
-- =======================================================

INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Retenir 3 mots',
  'facile',
  'Écoutez trois mots et répétez-les dans le bon ordre.',
  '',
  7,
  'memoriser',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit trois mots. Répétez-les dans le même ordre sans les écrire.',
    'consigne_partenaire', 'Dites les trois mots lentement avec une courte pause entre chaque. Attendez 5 secondes avant de demander la réponse.',
    'listes', JSON_ARRAY(
      JSON_ARRAY('pain', 'lait', 'beurre'),
      JSON_ARRAY('chat', 'chien', 'lapin'),
      JSON_ARRAY('rouge', 'bleu', 'vert'),
      JSON_ARRAY('table', 'chaise', 'lit'),
      JSON_ARRAY('lundi', 'mercredi', 'vendredi'),
      JSON_ARRAY('pomme', 'poire', 'cerise'),
      JSON_ARRAY('médecin', 'infirmière', 'pharmacien'),
      JSON_ARRAY('maison', 'jardin', 'garage')
    )
  )
),
(
  'Mémoriser une séquence',
  'moyen',
  'Retenez l''ordre d''une séquence de mots ou d''actions.',
  '',
  7,
  'memoriser',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit une liste de 4 à 5 éléments dans un ordre précis. Répétez-les dans le même ordre.',
    'consigne_partenaire', 'Lisez la liste une seule fois, à vitesse normale. Attendez 10 secondes avant de demander la réponse.',
    'sequences', JSON_ARRAY(
      JSON_OBJECT('contexte', 'Ingrédients d''une recette', 'elements', JSON_ARRAY('farine', 'œufs', 'lait', 'sucre', 'beurre')),
      JSON_OBJECT('contexte', 'Étapes du matin', 'elements', JSON_ARRAY('réveil', 'douche', 'petit-déjeuner', 'habillage', 'départ')),
      JSON_OBJECT('contexte', 'Directions', 'elements', JSON_ARRAY('tout droit', 'à gauche', 'à droite', 'tout droit', 'à gauche')),
      JSON_OBJECT('contexte', 'Jours de rendez-vous', 'elements', JSON_ARRAY('lundi matin', 'mercredi après-midi', 'vendredi matin')),
      JSON_OBJECT('contexte', 'Liste de courses', 'elements', JSON_ARRAY('tomates', 'fromage', 'jambon', 'yaourt', 'jus d''orange'))
    )
  )
),
(
  'Retenir les détails d''une histoire',
  'moyen',
  'Écoutez une courte histoire et répondez aux questions.',
  '',
  7,
  'memoriser',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit une courte histoire. Écoutez attentivement, puis répondez aux questions sans que l''histoire soit relue.',
    'consigne_partenaire', 'Lisez l''histoire une fois, à voix haute et clairement. Posez ensuite les questions une par une.',
    'histoires', JSON_ARRAY(
      JSON_OBJECT(
        'titre', 'Le marché du samedi',
        'texte', 'Marie se lève tôt le samedi matin. Elle prend son panier en osier et marche jusqu''au marché du quartier. Elle achète des légumes frais : des carottes, des poireaux et des champignons. Elle s''arrête aussi chez le fromager pour prendre un camembert. En rentrant, elle croise son voisin Paul qui promène son chien.',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'Quel jour Marie va-t-elle au marché ?', 'reponse', 'Le samedi'),
          JSON_OBJECT('question', 'Qu''est-ce qu''elle emporte pour faire ses courses ?', 'reponse', 'Un panier en osier'),
          JSON_OBJECT('question', 'Citez deux légumes qu''elle achète.', 'reponse', 'Carottes, poireaux ou champignons'),
          JSON_OBJECT('question', 'Qu''achète-t-elle chez le fromager ?', 'reponse', 'Un camembert'),
          JSON_OBJECT('question', 'Qui croise-t-elle en rentrant ?', 'reponse', 'Son voisin Paul')
        )
      ),
      JSON_OBJECT(
        'titre', 'Le rendez-vous médical',
        'texte', 'Thomas a rendez-vous chez le médecin à quatorze heures trente. Il attend vingt minutes dans la salle d''attente. Le médecin l''examine et lui dit qu''il a une légère grippe. Il lui prescrit du repos, beaucoup de liquides et lui donne une ordonnance pour un médicament. Thomas doit revenir dans une semaine si les symptômes persistent.',
        'questions', JSON_ARRAY(
          JSON_OBJECT('question', 'À quelle heure est le rendez-vous de Thomas ?', 'reponse', 'Quatorze heures trente'),
          JSON_OBJECT('question', 'Combien de temps attend-il ?', 'reponse', 'Vingt minutes'),
          JSON_OBJECT('question', 'Quel est le diagnostic du médecin ?', 'reponse', 'Une légère grippe'),
          JSON_OBJECT('question', 'Que lui conseille le médecin ?', 'reponse', 'Du repos et beaucoup de liquides'),
          JSON_OBJECT('question', 'Quand doit-il revenir ?', 'reponse', 'Dans une semaine')
        )
      )
    )
  )
),
(
  'Rappel différé',
  'difficile',
  'Mémorisez une liste, faites autre chose, puis rappelez-vous.',
  '',
  7,
  'memoriser',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous lit une liste. Vous discutez d''autre chose pendant 2 minutes, puis vous devez rappeler le maximum d''éléments de la liste.',
    'consigne_partenaire', 'Lisez la liste lentement. Pendant 2 minutes, engagez une conversation sur un autre sujet. Demandez ensuite quels éléments ont été retenus.',
    'listes', JSON_ARRAY(
      JSON_OBJECT('theme', 'Choses à faire aujourd''hui', 'elements', JSON_ARRAY('appeler le médecin', 'acheter du pain', 'arroser les plantes', 'rappeler Sophie', 'prendre les médicaments', 'sortir les poubelles')),
      JSON_OBJECT('theme', 'Pays d''Europe', 'elements', JSON_ARRAY('France', 'Allemagne', 'Italie', 'Espagne', 'Portugal', 'Belgique', 'Suisse')),
      JSON_OBJECT('theme', 'Animaux de la ferme', 'elements', JSON_ARRAY('vache', 'cochon', 'mouton', 'chèvre', 'canard', 'poule', 'lapin', 'cheval'))
    )
  )
);


-- =======================================================
-- CATÉGORIE 8 — THÈMES
-- Format inspiré : vocabulaire par sujet + phrases contextuelles
-- =======================================================

INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Thème : La météo',
  'facile',
  'Phrases du quotidien sur le thème de la météo.',
  '',
  8,
  'themes',
  JSON_OBJECT(
    'theme', 'La météo',
    'instructions', 'Votre partenaire révèle le thème puis lit chaque phrase. Répétez-la. Si vous n''avez pas compris, le mot souligné est un indice.',
    'consigne_partenaire', 'Annoncez le thème "La météo". Lisez chaque phrase normalement. Si l''auditeur n''a pas compris après 2 essais, prononcez le mot clé seul.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('texte', 'Il fait beau aujourd''hui.', 'mot_cle', 'beau'),
      JSON_OBJECT('texte', 'N''oublie pas ton parapluie, il va pleuvoir.', 'mot_cle', 'parapluie'),
      JSON_OBJECT('texte', 'Le vent est très fort ce matin.', 'mot_cle', 'vent'),
      JSON_OBJECT('texte', 'On annonce de la neige pour ce week-end.', 'mot_cle', 'neige'),
      JSON_OBJECT('texte', 'Il fait trop chaud pour sortir en plein soleil.', 'mot_cle', 'chaud'),
      JSON_OBJECT('texte', 'Le ciel est couvert, on ne voit pas le soleil.', 'mot_cle', 'couvert'),
      JSON_OBJECT('texte', 'La température va descendre ce soir.', 'mot_cle', 'température'),
      JSON_OBJECT('texte', 'C''est une belle journée ensoleillée.', 'mot_cle', 'ensoleillée')
    )
  )
),
(
  'Thème : La famille',
  'facile',
  'Phrases du quotidien sur le thème de la famille.',
  '',
  8,
  'themes',
  JSON_OBJECT(
    'theme', 'La famille',
    'instructions', 'Votre partenaire révèle le thème puis lit chaque phrase. Répétez-la.',
    'consigne_partenaire', 'Annoncez le thème "La famille". Lisez chaque phrase normalement.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('texte', 'Ma fille a eu son baccalauréat cette année.', 'mot_cle', 'fille'),
      JSON_OBJECT('texte', 'Mon frère habite à Lyon depuis cinq ans.', 'mot_cle', 'frère'),
      JSON_OBJECT('texte', 'Nous allons fêter l''anniversaire de grand-mère dimanche.', 'mot_cle', 'anniversaire'),
      JSON_OBJECT('texte', 'Mes enfants rentrent de l''école à seize heures.', 'mot_cle', 'enfants'),
      JSON_OBJECT('texte', 'Mon mari prépare le dîner ce soir.', 'mot_cle', 'mari'),
      JSON_OBJECT('texte', 'On se retrouve tous en famille à Noël.', 'mot_cle', 'famille'),
      JSON_OBJECT('texte', 'Ma sœur vient me rendre visite ce week-end.', 'mot_cle', 'sœur'),
      JSON_OBJECT('texte', 'Le bébé a fait ses premiers pas hier.', 'mot_cle', 'premiers pas')
    )
  )
),
(
  'Thème : Le travail',
  'moyen',
  'Phrases du quotidien sur le thème du travail.',
  '',
  8,
  'themes',
  JSON_OBJECT(
    'theme', 'Le travail',
    'instructions', 'Votre partenaire révèle le thème puis lit chaque phrase. Répétez-la.',
    'consigne_partenaire', 'Annoncez le thème "Le travail". Lisez chaque phrase normalement. En cas de difficulté, dites le mot clé.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('texte', 'J''ai une réunion importante à neuf heures.', 'mot_cle', 'réunion'),
      JSON_OBJECT('texte', 'Mon collègue est en congé maladie cette semaine.', 'mot_cle', 'congé'),
      JSON_OBJECT('texte', 'Il faut envoyer ce rapport avant vendredi.', 'mot_cle', 'rapport'),
      JSON_OBJECT('texte', 'Je travaille en télétravail le vendredi.', 'mot_cle', 'télétravail'),
      JSON_OBJECT('texte', 'On cherche quelqu''un pour remplacer le directeur.', 'mot_cle', 'directeur'),
      JSON_OBJECT('texte', 'J''ai eu une augmentation ce mois-ci.', 'mot_cle', 'augmentation'),
      JSON_OBJECT('texte', 'L''entretien d''embauche s''est bien passé.', 'mot_cle', 'entretien'),
      JSON_OBJECT('texte', 'On a fini le projet en avance sur le planning.', 'mot_cle', 'projet')
    )
  )
),
(
  'Thème : Les voyages',
  'moyen',
  'Phrases du quotidien sur le thème des voyages.',
  '',
  8,
  'themes',
  JSON_OBJECT(
    'theme', 'Les voyages',
    'instructions', 'Votre partenaire révèle le thème puis lit chaque phrase. Répétez-la.',
    'consigne_partenaire', 'Annoncez le thème "Les voyages". Lisez chaque phrase normalement.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('texte', 'Il faut être à l''aéroport deux heures avant le départ.', 'mot_cle', 'aéroport'),
      JSON_OBJECT('texte', 'J''ai réservé un hôtel près du centre-ville.', 'mot_cle', 'hôtel'),
      JSON_OBJECT('texte', 'Mon passeport expire l''année prochaine.', 'mot_cle', 'passeport'),
      JSON_OBJECT('texte', 'Le vol a été retardé d''une heure.', 'mot_cle', 'retardé'),
      JSON_OBJECT('texte', 'On a visité un musée magnifique hier.', 'mot_cle', 'musée'),
      JSON_OBJECT('texte', 'Je ne parle pas très bien la langue du pays.', 'mot_cle', 'langue'),
      JSON_OBJECT('texte', 'La valise est trop lourde, il faut enlever des affaires.', 'mot_cle', 'valise'),
      JSON_OBJECT('texte', 'Nous rentrons à la maison samedi soir.', 'mot_cle', 'rentrons')
    )
  )
),
(
  'Thème : Chez le médecin',
  'difficile',
  'Phrases courantes dans un contexte médical.',
  '',
  8,
  'themes',
  JSON_OBJECT(
    'theme', 'Chez le médecin',
    'instructions', 'Votre partenaire révèle le thème puis lit chaque phrase. Répétez-la.',
    'consigne_partenaire', 'Annoncez le thème "Chez le médecin". Lisez chaque phrase normalement. C''est un thème plus difficile car le vocabulaire est spécialisé.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('texte', 'J''ai mal à la gorge depuis trois jours.', 'mot_cle', 'gorge'),
      JSON_OBJECT('texte', 'Vous devez prendre ce médicament avant les repas.', 'mot_cle', 'médicament'),
      JSON_OBJECT('texte', 'Je vous prescris des antibiotiques pour dix jours.', 'mot_cle', 'antibiotiques'),
      JSON_OBJECT('texte', 'Avez-vous des antécédents médicaux particuliers ?', 'mot_cle', 'antécédents'),
      JSON_OBJECT('texte', 'Il faut faire une prise de sang à jeun.', 'mot_cle', 'prise de sang'),
      JSON_OBJECT('texte', 'Les résultats de l''analyse seront disponibles demain.', 'mot_cle', 'résultats'),
      JSON_OBJECT('texte', 'Votre tension artérielle est un peu élevée.', 'mot_cle', 'tension'),
      JSON_OBJECT('texte', 'Je vous oriente vers un spécialiste.', 'mot_cle', 'spécialiste')
    )
  )
),
(
  'Thème : Au restaurant',
  'difficile',
  'Phrases courantes dans un contexte de restaurant.',
  '',
  8,
  'themes',
  JSON_OBJECT(
    'theme', 'Au restaurant',
    'instructions', 'Votre partenaire révèle le thème puis lit chaque phrase. Répétez-la.',
    'consigne_partenaire', 'Annoncez le thème "Au restaurant". C''est un thème difficile car il peut y avoir du bruit en situation réelle.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('texte', 'Avez-vous une réservation au nom de Martin ?', 'mot_cle', 'réservation'),
      JSON_OBJECT('texte', 'Je voudrais une table pour deux personnes.', 'mot_cle', 'table'),
      JSON_OBJECT('texte', 'Qu''est-ce que vous recommandez aujourd''hui ?', 'mot_cle', 'recommandez'),
      JSON_OBJECT('texte', 'Le plat du jour est une sole meunière.', 'mot_cle', 'plat du jour'),
      JSON_OBJECT('texte', 'L''addition s''il vous plaît.', 'mot_cle', 'addition'),
      JSON_OBJECT('texte', 'Est-ce que le service est compris ?', 'mot_cle', 'service'),
      JSON_OBJECT('texte', 'Je suis allergique aux fruits de mer.', 'mot_cle', 'allergique'),
      JSON_OBJECT('texte', 'Pourriez-vous apporter de l''eau plate, s''il vous plaît ?', 'mot_cle', 'eau plate')
    )
  )
);
