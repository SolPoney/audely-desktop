-- =======================================================
-- SEEDS V4 — Ajout du contenu JSON aux exercices existants
-- =======================================================

-- ── CATÉGORIE 3 : DÉTECTER ──────────────────────────────

-- ID 1 : Grave ou aigu ?
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce un mot avec une voix grave ou aiguë. Dites si c''est grave ou aigu.',
  'consigne_partenaire', 'Prononcez chaque mot soit avec une voix grave, soit avec une voix aiguë, dans un ordre aléatoire.',
  'mots', JSON_ARRAY('chat', 'maison', 'soleil', 'porte', 'jardin', 'fleur', 'voiture', 'nuit', 'table', 'musique')
) WHERE id = 1;

-- ID 2 : Repérer le son
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Écoutez l''enregistrement et levez la main chaque fois que vous entendez le son cible.',
  'consigne_partenaire', 'Prononcez la liste de mots. L''auditeur doit réagir chaque fois qu''il entend le son cible.',
  'son_cible', 'S',
  'mots', JSON_ARRAY('soleil', 'maison', 'chat', 'sac', 'porte', 'saison', 'table', 'son', 'forêt', 'semaine', 'lumière', 'soir')
) WHERE id = 2;

-- ID 3 : Son grave ou aigu
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Écoutez et déterminez si le son est grave ou aigu.',
  'consigne_partenaire', 'Prononcez chaque syllabe soit avec une voix grave soit avec une voix aiguë.',
  'syllabes', JSON_ARRAY('ah', 'oh', 'ii', 'ou', 'eu', 'an', 'on', 'in')
) WHERE id = 3;

-- ID 4 : Son court ou long
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Écoutez et déterminez si la durée du son est courte ou longue.',
  'consigne_partenaire', 'Prononcez chaque mot soit rapidement (court) soit en étirant les syllabes (long).',
  'mots', JSON_ARRAY(
    JSON_OBJECT('mot', 'pain', 'type', 'court'),
    JSON_OBJECT('mot', 'bibliothèque', 'type', 'long'),
    JSON_OBJECT('mot', 'eau', 'type', 'court'),
    JSON_OBJECT('mot', 'anniversaire', 'type', 'long'),
    JSON_OBJECT('mot', 'chat', 'type', 'court'),
    JSON_OBJECT('mot', 'extraordinaire', 'type', 'long'),
    JSON_OBJECT('mot', 'nuit', 'type', 'court'),
    JSON_OBJECT('mot', 'télévision', 'type', 'long')
  )
) WHERE id = 4;

-- ID 5 : 1 ou 2 sons ?
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire produit un ou deux sons. Dites combien vous en entendez.',
  'consigne_partenaire', 'Frappez dans vos mains une ou deux fois avec une courte pause entre les deux si besoin.',
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
) WHERE id = 5;

-- ID 11 : Identique ou différent (doublon 1)
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce deux mots. Dites s''ils sont pareils ou différents.',
  'consigne_partenaire', 'Prononcez les deux mots l''un après l''autre. Certaines paires sont identiques.',
  'paires', JSON_ARRAY(
    JSON_OBJECT('mot1', 'pain', 'mot2', 'bain', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'sou', 'mot2', 'sou', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'mer', 'mot2', 'mer', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'vert', 'mot2', 'fer', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'vin', 'mot2', 'lin', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'rue', 'mot2', 'rue', 'resultat', 'pareil')
  )
) WHERE id = 11;

-- ID 12 : Identique ou différent (doublon 2)
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce deux mots. Dites s''ils sont pareils ou différents.',
  'consigne_partenaire', 'Prononcez les deux mots l''un après l''autre. Niveau plus difficile.',
  'paires', JSON_ARRAY(
    JSON_OBJECT('mot1', 'pont', 'mot2', 'bond', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'tôt', 'mot2', 'tôt', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'cou', 'mot2', 'genou', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'chat', 'mot2', 'gat', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'fin', 'mot2', 'fin', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'belle', 'mot2', 'pelle', 'resultat', 'différent')
  )
) WHERE id = 12;

-- ID 13 : Son fort ou faible ?
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce une phrase soit fort soit doucement. Identifiez l''intensité.',
  'consigne_partenaire', 'Lisez chaque phrase en alternant fort et doucement dans un ordre aléatoire.',
  'phrases', JSON_ARRAY(
    'Bonjour, comment allez-vous ?',
    'Il fait beau aujourd''hui.',
    'J''ai faim, allons manger.',
    'La porte est ouverte.',
    'C''est l''heure du dîner.',
    'Le train part dans cinq minutes.'
  )
) WHERE id = 13;

-- ID 14 : Compter les frappes
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire frappe plusieurs fois. Comptez le nombre de frappes.',
  'consigne_partenaire', 'Frappez sur la table un nombre de fois entre 1 et 5. Faites une série de 10 essais.',
  'series', JSON_ARRAY(2, 4, 1, 3, 5, 2, 4, 1, 3, 2)
) WHERE id = 14;


-- ── CATÉGORIE 4 : RECONNAÎTRE ───────────────────────────

-- ID 6 : Reconnaître un animal
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire décrit un animal. Devinez lequel.',
  'consigne_partenaire', 'Décrivez l''animal sans le nommer : où il vit, ce qu''il mange, ses caractéristiques.',
  'animaux', JSON_ARRAY(
    JSON_OBJECT('animal', 'Le chien', 'indices', JSON_ARRAY('C''est un animal domestique', 'Il aboie', 'Il est souvent appelé meilleur ami de l''homme')),
    JSON_OBJECT('animal', 'Le chat', 'indices', JSON_ARRAY('Il ronronne', 'Il aime dormir au soleil', 'Il est très indépendant')),
    JSON_OBJECT('animal', 'Le coq', 'indices', JSON_ARRAY('Il chante le matin', 'Il vit à la ferme', 'Il a un plumage coloré')),
    JSON_OBJECT('animal', 'La grenouille', 'indices', JSON_ARRAY('Elle coasse', 'Elle vit près de l''eau', 'Elle saute très haut')),
    JSON_OBJECT('animal', 'L''éléphant', 'indices', JSON_ARRAY('C''est le plus grand animal terrestre', 'Il a une trompe', 'Il vit en Afrique ou en Asie')),
    JSON_OBJECT('animal', 'Le hibou', 'indices', JSON_ARRAY('Il sort la nuit', 'Il fait ''hou hou''', 'Il tourne la tête à 270 degrés'))
  )
) WHERE id = 6;

-- ID 7 : Reconnaître un instrument
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire décrit un instrument de musique. Nommez-le.',
  'consigne_partenaire', 'Décrivez l''instrument sans le nommer : apparence, comment on en joue, quel son il produit.',
  'instruments', JSON_ARRAY(
    JSON_OBJECT('instrument', 'Le piano', 'indices', JSON_ARRAY('On appuie sur des touches noires et blanches', 'Il peut être très grand', 'Beethoven en jouait')),
    JSON_OBJECT('instrument', 'La guitare', 'indices', JSON_ARRAY('On pince des cordes', 'On peut en jouer assis', 'Très utilisée en rock')),
    JSON_OBJECT('instrument', 'Le violon', 'indices', JSON_ARRAY('On le tient sous le menton', 'On utilise un archet', 'C''est un instrument à cordes frottées')),
    JSON_OBJECT('instrument', 'La flûte', 'indices', JSON_ARRAY('On souffle dedans', 'C''est un tube long et fin', 'Elle produit des sons aigus')),
    JSON_OBJECT('instrument', 'La batterie', 'indices', JSON_ARRAY('On le frappe avec des baguettes', 'Il donne le rythme', 'Il est composé de plusieurs tambours'))
  )
) WHERE id = 7;

-- ID 8 : Reconnaître une voyelle
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce une voyelle isolée. Identifiez laquelle.',
  'consigne_partenaire', 'Prononcez chaque voyelle clairement et de façon isolée.',
  'voyelles', JSON_ARRAY('A', 'E', 'I', 'O', 'U', 'OU', 'AN', 'ON', 'IN', 'EU')
) WHERE id = 8;

-- ID 9 : Reconnaître une émotion
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire lit la même phrase avec différentes émotions. Identifiez l''émotion.',
  'consigne_partenaire', 'Lisez toujours la même phrase mais avec l''émotion indiquée. Ne dites pas l''émotion.',
  'phrase_support', 'Je vais aller faire les courses cet après-midi.',
  'emotions', JSON_ARRAY('joie', 'tristesse', 'colère', 'surprise', 'peur', 'ennui', 'enthousiasme')
) WHERE id = 9;

-- ID 10 : Suivez le rythme
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Écoutez le rythme frappé par votre partenaire et reproduisez-le.',
  'consigne_partenaire', 'Frappez chaque rythme sur la table. L''auditeur doit le reproduire.',
  'rythmes', JSON_ARRAY(
    JSON_OBJECT('notation', 'court-court-long', 'description', '2 frappes rapides puis 1 longue'),
    JSON_OBJECT('notation', 'long-court-court-court', 'description', '1 longue puis 3 rapides'),
    JSON_OBJECT('notation', 'court-long-court', 'description', '1 courte, 1 longue, 1 courte'),
    JSON_OBJECT('notation', 'long-long-court', 'description', '2 longues puis 1 courte'),
    JSON_OBJECT('notation', 'court-court-court-long', 'description', '3 rapides puis 1 longue')
  )
) WHERE id = 10;

-- ID 15 : Reconnaître un bruit du quotidien
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire décrit un son sans le nommer. Devinez de quel son il s''agit.',
  'consigne_partenaire', 'Décrivez le son avec des mots, sans le nommer directement.',
  'sons', JSON_ARRAY(
    JSON_OBJECT('son', 'La pluie', 'description', 'C''est un bruit continu de gouttes qui tombent sur les vitres'),
    JSON_OBJECT('son', 'La sonnerie du téléphone', 'description', 'C''est un son répétitif qui vous appelle à répondre'),
    JSON_OBJECT('son', 'Le micro-ondes', 'description', 'C''est un bip court qui annonce que votre plat est chaud'),
    JSON_OBJECT('son', 'Un chien qui aboie', 'description', 'C''est le cri d''un animal domestique qui surveille la maison'),
    JSON_OBJECT('son', 'La cafetière', 'description', 'C''est un gargouillis régulier qui prépare votre boisson du matin'),
    JSON_OBJECT('son', 'Une clé dans la serrure', 'description', 'C''est un bruit métallique suivi d''un clic quand on entre chez soi')
  )
) WHERE id = 15;

-- ID 16 : Reconnaître une consonne
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce une consonne isolée. Identifiez laquelle.',
  'consigne_partenaire', 'Prononcez chaque consonne clairement, dans un ordre aléatoire.',
  'consonnes', JSON_ARRAY('P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'S', 'Z', 'CH', 'J', 'M', 'N', 'L', 'R')
) WHERE id = 16;


-- ── CATÉGORIE 5 : DISTINGUER ────────────────────────────

-- ID 17 : Même son ou différent ?
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce deux mots. Dites s''ils sont pareils ou différents.',
  'consigne_partenaire', 'Prononcez les deux mots l''un après l''autre avec une courte pause.',
  'paires', JSON_ARRAY(
    JSON_OBJECT('mot1', 'pain', 'mot2', 'bain', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'sou', 'mot2', 'sou', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'vert', 'mot2', 'fer', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'tôt', 'mot2', 'tôt', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'vin', 'mot2', 'lin', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'pont', 'mot2', 'bond', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'rue', 'mot2', 'rue', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'cou', 'mot2', 'genou', 'resultat', 'différent'),
    JSON_OBJECT('mot1', 'mer', 'mot2', 'mer', 'resultat', 'pareil'),
    JSON_OBJECT('mot1', 'chat', 'mot2', 'gat', 'resultat', 'différent')
  )
) WHERE id = 17;

-- ID 18 : Grave ou aigu ? Comparaison
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce deux mots, l''un grave l''un aigu. Identifiez lequel est grave.',
  'consigne_partenaire', 'Prononcez les deux mots dans un ordre aléatoire, l''un grave, l''autre aigu.',
  'paires', JSON_ARRAY(
    JSON_OBJECT('mot_grave', 'voiture', 'mot_aigu', 'oiseau'),
    JSON_OBJECT('mot_grave', 'montagne', 'mot_aigu', 'flûte'),
    JSON_OBJECT('mot_grave', 'tambour', 'mot_aigu', 'cloche'),
    JSON_OBJECT('mot_grave', 'forêt', 'mot_aigu', 'cigale'),
    JSON_OBJECT('mot_grave', 'tonnerre', 'mot_aigu', 'sifflet')
  )
) WHERE id = 18;

-- ID 19 : Deux mots proches
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire choisit et prononce un mot parmi deux mots phonétiquement proches. Identifiez lequel.',
  'consigne_partenaire', 'Choisissez un mot au hasard dans chaque paire et prononcez-le naturellement.',
  'paires', JSON_ARRAY(
    JSON_ARRAY('mer', 'mère'),
    JSON_ARRAY('pain', 'bain'),
    JSON_ARRAY('vert', 'fer'),
    JSON_ARRAY('son', 'bon'),
    JSON_ARRAY('tante', 'dente'),
    JSON_ARRAY('pile', 'bile'),
    JSON_ARRAY('four', 'tour'),
    JSON_ARRAY('sac', 'bac'),
    JSON_ARRAY('lent', 'rang'),
    JSON_ARRAY('peur', 'beurre')
  )
) WHERE id = 19;

-- ID 20 : Distinguer des syllabes
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire prononce une syllabe. Dites laquelle vous avez entendue.',
  'consigne_partenaire', 'Prononcez la syllabe choisie clairement, sans exagérer.',
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
) WHERE id = 20;

-- ID 21 : Sons similaires
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire choisit et prononce un mot parmi quatre mots très proches. Identifiez lequel.',
  'consigne_partenaire', 'Pour chaque groupe, choisissez un mot au hasard et prononcez-le naturellement.',
  'groupes', JSON_ARRAY(
    JSON_ARRAY('mer', 'mère', 'maire', 'mais'),
    JSON_ARRAY('son', 'sans', 'sang', 'cent'),
    JSON_ARRAY('vert', 'ver', 'verre', 'vers'),
    JSON_ARRAY('pain', 'pin', 'bain', 'bien'),
    JSON_ARRAY('saint', 'sain', 'sein', 'cinq'),
    JSON_ARRAY('cou', 'coût', 'coup', 'queue')
  )
) WHERE id = 21;


-- ── CATÉGORIE 6 : COMPRENDRE ────────────────────────────

-- ID 22 : Complétez la phrase
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire vous montre les alternatives, puis lit la phrase en choisissant l''un des mots. Dites lequel a été prononcé.',
  'consigne_partenaire', 'Montrez la liste à l''auditeur. Lisez la phrase en choisissant un mot au hasard sans le montrer.',
  'phrases', JSON_ARRAY(
    JSON_OBJECT('phrase', 'Ce matin, j''ai bu mon ...... chaud.', 'alternatives', JSON_ARRAY('café', 'thé', 'lait', 'chocolat')),
    JSON_OBJECT('phrase', 'Il fait froid, prends ton ......', 'alternatives', JSON_ARRAY('manteau', 'chapeau', 'parapluie')),
    JSON_OBJECT('phrase', 'J''ai lu un bon ...... ce week-end.', 'alternatives', JSON_ARRAY('livre', 'journal', 'magazine')),
    JSON_OBJECT('phrase', 'On mange à quelle ...... ce soir ?', 'alternatives', JSON_ARRAY('heure', 'table', 'place')),
    JSON_OBJECT('phrase', 'J''ai acheté du ...... à la boulangerie.', 'alternatives', JSON_ARRAY('pain', 'croissant', 'gâteau')),
    JSON_OBJECT('phrase', 'Le médecin m''a donné une ......', 'alternatives', JSON_ARRAY('ordonnance', 'pilule', 'piqûre')),
    JSON_OBJECT('phrase', 'Peux-tu ouvrir la ...... s''il te plaît ?', 'alternatives', JSON_ARRAY('fenêtre', 'porte', 'boîte')),
    JSON_OBJECT('phrase', 'On a regardé un bon ...... hier soir.', 'alternatives', JSON_ARRAY('film', 'match', 'spectacle')),
    JSON_OBJECT('phrase', 'Le train part de quel ...... ?', 'alternatives', JSON_ARRAY('quai', 'billet', 'wagon')),
    JSON_OBJECT('phrase', 'Elle travaille à l''...... depuis dix ans.', 'alternatives', JSON_ARRAY('hôpital', 'école', 'université')),
    JSON_OBJECT('phrase', 'J''ai oublié mon ...... à la maison.', 'alternatives', JSON_ARRAY('téléphone', 'portefeuille', 'trousseau')),
    JSON_OBJECT('phrase', 'Le ...... est rouge ce soir, il fera beau demain.', 'alternatives', JSON_ARRAY('ciel', 'soleil', 'nuage'))
  )
) WHERE id = 22;

-- ID 23 : Le bon contexte
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire lit une phrase entière. Utilisez le contexte pour identifier le mot prononcé.',
  'consigne_partenaire', 'Lisez la phrase entière. L''auditeur utilise le sens pour identifier le mot parmi les alternatives.',
  'phrases', JSON_ARRAY(
    JSON_OBJECT('phrase', 'J''avais très froid, alors j''ai allumé le ......', 'alternatives', JSON_ARRAY('chauffage', 'ventilateur', 'climatiseur')),
    JSON_OBJECT('phrase', 'Elle était fatiguée, elle s''est couchée sans regarder la ......', 'alternatives', JSON_ARRAY('télévision', 'fenêtre', 'montre')),
    JSON_OBJECT('phrase', 'Il avait oublié son parapluie et il est rentré complètement ......', 'alternatives', JSON_ARRAY('trempé', 'bronzé', 'fatigué')),
    JSON_OBJECT('phrase', 'Le gâteau était brûlé car elle l''avait laissé trop longtemps dans le ......', 'alternatives', JSON_ARRAY('four', 'congélateur', 'frigo')),
    JSON_OBJECT('phrase', 'Il avait perdu ses clés et n''a pas pu entrer dans sa ......', 'alternatives', JSON_ARRAY('maison', 'voiture', 'valise')),
    JSON_OBJECT('phrase', 'Il pleuvait fort, alors elle a pris son ...... avant de sortir.', 'alternatives', JSON_ARRAY('parapluie', 'manteau', 'chapeau'))
  )
) WHERE id = 23;

-- ID 24 : Phrases sur un sujet
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire annonce le thème, puis lit chaque phrase. Répétez-la.',
  'consigne_partenaire', 'Annoncez le thème. Lisez chaque phrase lentement. Attendez que l''auditeur répète avant de continuer.',
  'themes', JSON_ARRAY(
    JSON_OBJECT('theme', 'La cuisine', 'phrases', JSON_ARRAY(
      'Qu''est-ce qu''on mange ce soir ?',
      'Le repas est prêt, tu peux venir.',
      'J''ai fait une tarte aux pommes.',
      'Tu veux encore de la soupe ?',
      'Je mets la table pour quatre personnes.'
    )),
    JSON_OBJECT('theme', 'La santé', 'phrases', JSON_ARRAY(
      'Je n''ai pas bien dormi cette nuit.',
      'J''ai un rendez-vous chez le médecin.',
      'Il faut prendre ce médicament deux fois par jour.',
      'Comment vous sentez-vous aujourd''hui ?',
      'Il faut boire suffisamment d''eau.'
    )),
    JSON_OBJECT('theme', 'Les transports', 'phrases', JSON_ARRAY(
      'Le bus a du retard ce matin.',
      'À quelle heure part le prochain train ?',
      'Il faut composter son billet avant de monter.',
      'Il y a des embouteillages sur l''autoroute.',
      'L''avion atterrit dans vingt minutes.'
    )),
    JSON_OBJECT('theme', 'Les courses', 'phrases', JSON_ARRAY(
      'J''ai besoin de pain et de lait.',
      'Le supermarché ferme à vingt heures.',
      'Tu as la liste de courses ?',
      'Les tomates sont en promotion aujourd''hui.',
      'Il ne reste plus de farine, j''en achète ?'
    ))
  )
) WHERE id = 24;

-- ID 25 : Questions et réponses
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire vous pose des questions. Répondez le plus naturellement possible.',
  'consigne_partenaire', 'Posez chaque question clairement. Si l''auditeur ne comprend pas, reformulez.',
  'themes', JSON_ARRAY(
    JSON_OBJECT('theme', 'La journée', 'questions', JSON_ARRAY(
      'À quelle heure vous levez-vous en général ?',
      'Qu''est-ce que vous mangez au petit-déjeuner ?',
      'Comment venez-vous ici ce matin ?',
      'Avez-vous bien dormi cette nuit ?',
      'Qu''avez-vous fait hier soir ?'
    )),
    JSON_OBJECT('theme', 'Les loisirs', 'questions', JSON_ARRAY(
      'Qu''aimez-vous faire le week-end ?',
      'Regardez-vous souvent la télévision ?',
      'Avez-vous un sport préféré ?',
      'Lisez-vous beaucoup ?',
      'Aimez-vous la musique ?'
    ))
  )
) WHERE id = 25;


-- ── CATÉGORIE 7 : MÉMORISER ─────────────────────────────

-- ID 26 : Retenir 3 mots
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire dit trois mots. Répétez-les dans le même ordre sans les écrire.',
  'consigne_partenaire', 'Dites les trois mots avec une courte pause entre chaque. Attendez 5 secondes avant de demander la réponse.',
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
) WHERE id = 26;

-- ID 27 : Mémoriser une séquence
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire lit une liste de 4 à 5 éléments. Répétez-les dans le même ordre.',
  'consigne_partenaire', 'Lisez la liste une seule fois à vitesse normale. Attendez 10 secondes avant de demander la réponse.',
  'sequences', JSON_ARRAY(
    JSON_OBJECT('contexte', 'Ingrédients d''une recette', 'elements', JSON_ARRAY('farine', 'oeufs', 'lait', 'sucre', 'beurre')),
    JSON_OBJECT('contexte', 'Étapes du matin', 'elements', JSON_ARRAY('réveil', 'douche', 'petit-déjeuner', 'habillage', 'départ')),
    JSON_OBJECT('contexte', 'Directions', 'elements', JSON_ARRAY('tout droit', 'à gauche', 'à droite', 'tout droit', 'à gauche')),
    JSON_OBJECT('contexte', 'Jours de rendez-vous', 'elements', JSON_ARRAY('lundi matin', 'mercredi après-midi', 'vendredi matin')),
    JSON_OBJECT('contexte', 'Liste de courses', 'elements', JSON_ARRAY('tomates', 'fromage', 'jambon', 'yaourt', 'jus d''orange'))
  )
) WHERE id = 27;

-- ID 28 : Retenir les détails d'une histoire
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire lit une courte histoire. Écoutez attentivement, puis répondez aux questions.',
  'consigne_partenaire', 'Lisez l''histoire une fois à voix haute. Posez ensuite les questions une par une.',
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
      'texte', 'Thomas a rendez-vous chez le médecin à quatorze heures trente. Il attend vingt minutes dans la salle d''attente. Le médecin l''examine et lui dit qu''il a une légère grippe. Il lui prescrit du repos, beaucoup de liquides et lui donne une ordonnance. Thomas doit revenir dans une semaine si les symptômes persistent.',
      'questions', JSON_ARRAY(
        JSON_OBJECT('question', 'À quelle heure est le rendez-vous de Thomas ?', 'reponse', 'Quatorze heures trente'),
        JSON_OBJECT('question', 'Combien de temps attend-il ?', 'reponse', 'Vingt minutes'),
        JSON_OBJECT('question', 'Quel est le diagnostic ?', 'reponse', 'Une légère grippe'),
        JSON_OBJECT('question', 'Que lui conseille le médecin ?', 'reponse', 'Du repos et beaucoup de liquides'),
        JSON_OBJECT('question', 'Quand doit-il revenir ?', 'reponse', 'Dans une semaine')
      )
    )
  )
) WHERE id = 28;

-- ID 29 : Rappel différé
UPDATE Exercices SET contenu = JSON_OBJECT(
  'instructions', 'Votre partenaire vous lit une liste. Vous discutez d''autre chose pendant 2 minutes, puis vous rappelez le maximum d''éléments.',
  'consigne_partenaire', 'Lisez la liste lentement. Pendant 2 minutes, parlez d''autre chose. Demandez ensuite quels éléments ont été retenus.',
  'listes', JSON_ARRAY(
    JSON_OBJECT('theme', 'Choses à faire aujourd''hui', 'elements', JSON_ARRAY('appeler le médecin', 'acheter du pain', 'arroser les plantes', 'rappeler Sophie', 'prendre les médicaments', 'sortir les poubelles')),
    JSON_OBJECT('theme', 'Pays d''Europe', 'elements', JSON_ARRAY('France', 'Allemagne', 'Italie', 'Espagne', 'Portugal', 'Belgique', 'Suisse')),
    JSON_OBJECT('theme', 'Animaux de la ferme', 'elements', JSON_ARRAY('vache', 'cochon', 'mouton', 'chèvre', 'canard', 'poule', 'lapin', 'cheval'))
  )
) WHERE id = 29;


-- ── CATÉGORIE 8 : THÈMES ────────────────────────────────

-- ID 30 : Thème : La météo
UPDATE Exercices SET contenu = JSON_OBJECT(
  'theme', 'La météo',
  'instructions', 'Votre partenaire annonce le thème puis lit chaque phrase. Répétez-la. En cas de difficulté, le mot clé est un indice.',
  'consigne_partenaire', 'Annoncez le thème. Lisez chaque phrase normalement. En cas de difficulté, prononcez le mot clé seul.',
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
) WHERE id = 30;

-- ID 31 : Thème : La famille
UPDATE Exercices SET contenu = JSON_OBJECT(
  'theme', 'La famille',
  'instructions', 'Votre partenaire annonce le thème puis lit chaque phrase. Répétez-la.',
  'consigne_partenaire', 'Annoncez le thème. Lisez chaque phrase normalement.',
  'phrases', JSON_ARRAY(
    JSON_OBJECT('texte', 'Ma fille a eu son baccalauréat cette année.', 'mot_cle', 'fille'),
    JSON_OBJECT('texte', 'Mon frère habite à Lyon depuis cinq ans.', 'mot_cle', 'frère'),
    JSON_OBJECT('texte', 'Nous allons fêter l''anniversaire de grand-mère dimanche.', 'mot_cle', 'anniversaire'),
    JSON_OBJECT('texte', 'Mes enfants rentrent de l''école à seize heures.', 'mot_cle', 'enfants'),
    JSON_OBJECT('texte', 'Mon mari prépare le dîner ce soir.', 'mot_cle', 'mari'),
    JSON_OBJECT('texte', 'On se retrouve tous en famille à Noël.', 'mot_cle', 'famille'),
    JSON_OBJECT('texte', 'Ma sœur vient me rendre visite ce week-end.', 'mot_cle', 'soeur'),
    JSON_OBJECT('texte', 'Le bébé a fait ses premiers pas hier.', 'mot_cle', 'premiers pas')
  )
) WHERE id = 31;

-- ID 32 : Thème : Le travail
UPDATE Exercices SET contenu = JSON_OBJECT(
  'theme', 'Le travail',
  'instructions', 'Votre partenaire annonce le thème puis lit chaque phrase. Répétez-la.',
  'consigne_partenaire', 'Annoncez le thème. En cas de difficulté, dites le mot clé.',
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
) WHERE id = 32;

-- ID 33 : Thème : Les voyages
UPDATE Exercices SET contenu = JSON_OBJECT(
  'theme', 'Les voyages',
  'instructions', 'Votre partenaire annonce le thème puis lit chaque phrase. Répétez-la.',
  'consigne_partenaire', 'Annoncez le thème. Lisez chaque phrase normalement.',
  'phrases', JSON_ARRAY(
    JSON_OBJECT('texte', 'Il faut être à l''aéroport deux heures avant le départ.', 'mot_cle', 'aéroport'),
    JSON_OBJECT('texte', 'J''ai réservé un hôtel près du centre-ville.', 'mot_cle', 'hôtel'),
    JSON_OBJECT('texte', 'Mon passeport expire l''année prochaine.', 'mot_cle', 'passeport'),
    JSON_OBJECT('texte', 'Le vol a été retardé d''une heure.', 'mot_cle', 'retardé'),
    JSON_OBJECT('texte', 'On a visité un musée magnifique hier.', 'mot_cle', 'musée'),
    JSON_OBJECT('texte', 'La valise est trop lourde, il faut enlever des affaires.', 'mot_cle', 'valise'),
    JSON_OBJECT('texte', 'Nous rentrons à la maison samedi soir.', 'mot_cle', 'rentrons'),
    JSON_OBJECT('texte', 'Je ne parle pas très bien la langue du pays.', 'mot_cle', 'langue')
  )
) WHERE id = 33;

-- ID 34 : Thème : Chez le médecin
UPDATE Exercices SET contenu = JSON_OBJECT(
  'theme', 'Chez le médecin',
  'instructions', 'Votre partenaire annonce le thème puis lit chaque phrase. Répétez-la.',
  'consigne_partenaire', 'Annoncez le thème. Le vocabulaire médical est plus difficile — donnez le mot clé si besoin.',
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
) WHERE id = 34;

-- ID 35 : Thème : Au restaurant
UPDATE Exercices SET contenu = JSON_OBJECT(
  'theme', 'Au restaurant',
  'instructions', 'Votre partenaire annonce le thème puis lit chaque phrase. Répétez-la.',
  'consigne_partenaire', 'Annoncez le thème. Ce contexte est difficile car il y a souvent du bruit en situation réelle.',
  'phrases', JSON_ARRAY(
    JSON_OBJECT('texte', 'Avez-vous une réservation au nom de Martin ?', 'mot_cle', 'réservation'),
    JSON_OBJECT('texte', 'Je voudrais une table pour deux personnes.', 'mot_cle', 'table'),
    JSON_OBJECT('texte', 'Qu''est-ce que vous recommandez aujourd''hui ?', 'mot_cle', 'recommandez'),
    JSON_OBJECT('texte', 'Le plat du jour est une sole meunière.', 'mot_cle', 'plat du jour'),
    JSON_OBJECT('texte', 'L''addition s''il vous plaît.', 'mot_cle', 'addition'),
    JSON_OBJECT('texte', 'Est-ce que le service est compris ?', 'mot_cle', 'service'),
    JSON_OBJECT('texte', 'Je suis allergique aux fruits de mer.', 'mot_cle', 'allergique'),
    JSON_OBJECT('texte', 'Pourriez-vous apporter de l''eau plate s''il vous plaît ?', 'mot_cle', 'eau plate')
  )
) WHERE id = 35;
