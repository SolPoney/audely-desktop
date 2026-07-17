-- =======================================================
-- SEEDS V5 — Exercices français inspirés du programme
--            Cochlear Adult Aural Rehabilitation (2005)
-- Structure :
--   Section A — Entraînement analytique (distinguer, detecter, court_moyen_long, grave_aigu)
--   Section B — Entraînement synthétique (reconnaitre, comprendre, themes)
--   Section C — Thérapie de la communication (memoriser)
-- =======================================================

-- ═══════════════════════════════════════════════════════
-- SECTION A — ENTRAÎNEMENT ANALYTIQUE
-- ═══════════════════════════════════════════════════════

-- ── A1. Longueur de mots — écart maximum (inspiré Leçon 1.0) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Court ou très long ? (écart maximal)',
  'facile',
  'Votre partenaire dit un mot. Identifiez s''il est court (1 syllabe) ou très long (4 syllabes et plus).',
  '', 3, 'court_moyen_long',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Montrez ou dites lequel il a prononcé.',
    'consigne_partenaire', 'Choisissez l''un des deux mots de chaque paire et prononcez-le clairement. Attendez la réponse.',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('chat', 'bibliothèque'),     'syllabes', JSON_ARRAY(1, 5)),
      JSON_OBJECT('mots', JSON_ARRAY('nuit', 'extraordinaire'),   'syllabes', JSON_ARRAY(1, 6)),
      JSON_OBJECT('mots', JSON_ARRAY('pain', 'communication'),    'syllabes', JSON_ARRAY(1, 5)),
      JSON_OBJECT('mots', JSON_ARRAY('fleur', 'magnifiquement'),  'syllabes', JSON_ARRAY(1, 5)),
      JSON_OBJECT('mots', JSON_ARRAY('mer', 'responsabilité'),    'syllabes', JSON_ARRAY(1, 6)),
      JSON_OBJECT('mots', JSON_ARRAY('bois', 'réconciliation'),   'syllabes', JSON_ARRAY(1, 6)),
      JSON_OBJECT('mots', JSON_ARRAY('thé', 'vraisemblablement'), 'syllabes', JSON_ARRAY(1, 6)),
      JSON_OBJECT('mots', JSON_ARRAY('sol', 'individualité'),     'syllabes', JSON_ARRAY(1, 6)),
      JSON_OBJECT('mots', JSON_ARRAY('mur', 'incompréhensible'),  'syllabes', JSON_ARRAY(1, 6)),
      JSON_OBJECT('mots', JSON_ARRAY('rue', 'internationalisation'),'syllabes', JSON_ARRAY(1, 8))
    )
  )
),

-- ── A2. Longueur de mots — 4 niveaux d'écart (inspiré Leçon 1.1) ──
(
  'Écart de syllabes croissant',
  'moyen',
  'Identifiez le mot prononcé parmi deux options. L''écart de syllabes diminue progressivement.',
  '', 3, 'court_moyen_long',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Indiquez lequel.',
    'consigne_partenaire', 'Lisez les paires dans l''ordre. Prononcez un seul mot de chaque paire.',
    'niveaux', JSON_OBJECT(
      'A_ecart_4', JSON_ARRAY(
        JSON_OBJECT('mots', JSON_ARRAY('roi', 'incompréhensible')),
        JSON_OBJECT('mots', JSON_ARRAY('feu', 'extraordinairement')),
        JSON_OBJECT('mots', JSON_ARRAY('bas', 'vraisemblablement'))
      ),
      'B_ecart_3', JSON_ARRAY(
        JSON_OBJECT('mots', JSON_ARRAY('lait', 'anniversaire')),
        JSON_OBJECT('mots', JSON_ARRAY('jour', 'conversation')),
        JSON_OBJECT('mots', JSON_ARRAY('paix', 'responsable'))
      ),
      'C_ecart_2', JSON_ARRAY(
        JSON_OBJECT('mots', JSON_ARRAY('chat', 'maison')),
        JSON_OBJECT('mots', JSON_ARRAY('peur', 'avion')),
        JSON_OBJECT('mots', JSON_ARRAY('tard', 'cinéma'))
      ),
      'D_ecart_1', JSON_ARRAY(
        JSON_OBJECT('mots', JSON_ARRAY('nuit', 'chemin')),
        JSON_OBJECT('mots', JSON_ARRAY('froid', 'soleil')),
        JSON_OBJECT('mots', JSON_ARRAY('bras', 'jardin'))
      )
    )
  )
),

-- ── A3. Longueur de phrases (inspiré Leçon 1.7) ──
(
  'Quelle phrase a été dite ?',
  'moyen',
  'Votre partenaire lit une phrase parmi quatre. Identifiez laquelle grâce à sa longueur.',
  '', 3, 'court_moyen_long',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''une des quatre phrases. Indiquez laquelle.',
    'consigne_partenaire', 'Choisissez une phrase parmi les quatre proposées. L''auditeur voit les quatre phrases écrites.',
    'groupes', JSON_ARRAY(
      JSON_ARRAY(
        'Viens.',
        'Tu as faim ?',
        'Il fait beau aujourd''hui.',
        'Je pense que nous devrions partir très tôt demain matin.'
      ),
      JSON_ARRAY(
        'Merci.',
        'Il arrive.',
        'Appelle-moi ce soir.',
        'Elle a dit qu''elle préférait rester à la maison pour regarder la télévision.'
      ),
      JSON_ARRAY(
        'Pardon ?',
        'C''est loin.',
        'Je n''ai pas compris.',
        'Pouvez-vous répéter ce que vous venez de me dire plus lentement s''il vous plaît ?'
      ),
      JSON_ARRAY(
        'Attends.',
        'Tu viens ?',
        'Donne-moi ça maintenant.',
        'Le médecin m''a dit que je devais prendre ce médicament trois fois par jour.'
      )
    )
  )
),

-- ── A4. Fin de phrase à longueur variable (inspiré Leçon 1.12) ──
(
  'Quelle fin de phrase ?',
  'difficile',
  'Votre partenaire complète la phrase. Identifiez la fin parmi trois options de longueurs différentes.',
  '', 3, 'court_moyen_long',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit la fin de chaque phrase. Les options ont des longueurs très différentes.',
    'consigne_partenaire', 'Lisez le début de phrase, puis dites l''une des fins possibles. L''auditeur doit identifier laquelle.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT(
        'debut', 'Ce matin, j''ai mangé…',
        'fins', JSON_ARRAY('du pain.', 'des céréales avec du lait.', 'un croissant au beurre accompagné d''un café chaud.')
      ),
      JSON_OBJECT(
        'debut', 'Pour les vacances, nous partons…',
        'fins', JSON_ARRAY('en mer.', 'à la montagne.', 'découvrir les paysages magnifiques de la Bretagne.')
      ),
      JSON_OBJECT(
        'debut', 'Hier soir, il a regardé…',
        'fins', JSON_ARRAY('la télé.', 'un documentaire.', 'un long film historique sur la Révolution française.')
      ),
      JSON_OBJECT(
        'debut', 'Elle travaille…',
        'fins', JSON_ARRAY('là-bas.', 'à l''hôpital.', 'dans un grand cabinet d''avocat au centre-ville.')
      ),
      JSON_OBJECT(
        'debut', 'Mon voisin a acheté…',
        'fins', JSON_ARRAY('une voiture.', 'un appartement.', 'une belle maison avec jardin et piscine dans le sud de la France.')
      )
    )
  )
);

-- ── A5. Paires minimales — voyelles orales contrastées (inspiré Exercice 3.0) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Voyelles : [i] contre [u]',
  'facile',
  'Distinguez les voyelles fermées avant et arrière. Votre partenaire dit l''un des deux mots.',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Indiquez lequel vous avez entendu.',
    'consigne_partenaire', 'Dites un mot de chaque paire. Prononcez très distinctement les voyelles.',
    'principe', 'Contraste voyelle fermée antérieure [i] contre voyelle fermée postérieure [u]',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('vie', 'voue')),
      JSON_OBJECT('mots', JSON_ARRAY('lit', 'loup')),
      JSON_OBJECT('mots', JSON_ARRAY('ris', 'roue')),
      JSON_OBJECT('mots', JSON_ARRAY('gris', 'grou')),
      JSON_OBJECT('mots', JSON_ARRAY('bis', 'bouse')),
      JSON_OBJECT('mots', JSON_ARRAY('si', 'sous')),
      JSON_OBJECT('mots', JSON_ARRAY('ni', 'nous')),
      JSON_OBJECT('mots', JSON_ARRAY('vie', 'vous')),
      JSON_OBJECT('mots', JSON_ARRAY('tic', 'toux')),
      JSON_OBJECT('mots', JSON_ARRAY('dit', 'doux')),
      JSON_OBJECT('mots', JSON_ARRAY('fit', 'fou')),
      JSON_OBJECT('mots', JSON_ARRAY('mil', 'mou'))
    )
  )
),

-- ── A6. Paires minimales — voyelles [y] vs [u] (inspiré Exercice 3.2) ──
(
  'Voyelles : [u] contre [y]',
  'facile',
  'Distinguez "ou" de "u". Contraste très fréquent en français entre patients sourds.',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Lequel avez-vous entendu ?',
    'consigne_partenaire', 'Prononcez distinctement : "ou" est arrondi et reculé, "u" est arrondi et avancé.',
    'principe', 'Contraste [u] postérieur contre [y] antérieur arrondi',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('tout', 'tu')),
      JSON_OBJECT('mots', JSON_ARRAY('roue', 'rue')),
      JSON_OBJECT('mots', JSON_ARRAY('doux', 'du')),
      JSON_OBJECT('mots', JSON_ARRAY('sous', 'su')),
      JSON_OBJECT('mots', JSON_ARRAY('bout', 'bu')),
      JSON_OBJECT('mots', JSON_ARRAY('joue', 'jus')),
      JSON_OBJECT('mots', JSON_ARRAY('vous', 'vu')),
      JSON_OBJECT('mots', JSON_ARRAY('cou', 'cu')),
      JSON_OBJECT('mots', JSON_ARRAY('mou', 'mu')),
      JSON_OBJECT('mots', JSON_ARRAY('loup', 'lu')),
      JSON_OBJECT('mots', JSON_ARRAY('pou', 'pu')),
      JSON_OBJECT('mots', JSON_ARRAY('fou', 'fut'))
    )
  )
),

-- ── A7. Paires minimales — voyelles orales vs nasales (inspiré Exercice 3.5) ──
(
  'Voyelles orales contre nasales',
  'moyen',
  'Distinguez une voyelle orale de sa contrepartie nasale. Contraste fondamental du français.',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Indiquez lequel.',
    'consigne_partenaire', 'Contrastez voyelle nasale (résonnance dans le nez) et voyelle orale.',
    'principe', 'Contraste voyelle orale vs voyelle nasale correspondante',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('beau',  'bon')),
      JSON_OBJECT('mots', JSON_ARRAY('seau',  'son')),
      JSON_OBJECT('mots', JSON_ARRAY('fée',   'fin')),
      JSON_OBJECT('mots', JSON_ARRAY('paix',  'pain')),
      JSON_OBJECT('mots', JSON_ARRAY('dos',   'don')),
      JSON_OBJECT('mots', JSON_ARRAY('mot',   'mon')),
      JSON_OBJECT('mots', JSON_ARRAY('veau',  'vin')),
      JSON_OBJECT('mots', JSON_ARRAY('pot',   'pont')),
      JSON_OBJECT('mots', JSON_ARRAY('eau',   'an')),
      JSON_OBJECT('mots', JSON_ARRAY('faux',  'fan')),
      JSON_OBJECT('mots', JSON_ARRAY('bague', 'banque')),
      JSON_OBJECT('mots', JSON_ARRAY('page',  'panse')),
      JSON_OBJECT('mots', JSON_ARRAY('sage',  'sangle')),
      JSON_OBJECT('mots', JSON_ARRAY('cage',  'cante')),
      JSON_OBJECT('mots', JSON_ARRAY('tape',  'tante'))
    )
  )
),

-- ── A8. Paires minimales — consonnes voisées vs non-voisées (inspiré Exercice 3.10) ──
(
  'Consonnes voisées contre non-voisées',
  'moyen',
  'Distinguez [p/b], [t/d], [k/g], [f/v], [s/z], [ch/j]. Seul le voisement change.',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Lequel avez-vous entendu ?',
    'consigne_partenaire', 'Seul le voisement de la consonne initiale change. Prononcez très nettement.',
    'principe', 'Contraste voisé vs non-voisé — même lieu et même mode d''articulation',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('pain',  'bain')),
      JSON_OBJECT('mots', JSON_ARRAY('pas',   'bas')),
      JSON_OBJECT('mots', JSON_ARRAY('pont',  'bond')),
      JSON_OBJECT('mots', JSON_ARRAY('toit',  'doigt')),
      JSON_OBJECT('mots', JSON_ARRAY('tour',  'dour')),
      JSON_OBJECT('mots', JSON_ARRAY('tant',  'dans')),
      JSON_OBJECT('mots', JSON_ARRAY('cou',   'goût')),
      JSON_OBJECT('mots', JSON_ARRAY('car',   'gare')),
      JSON_OBJECT('mots', JSON_ARRAY('quai',  'gai')),
      JSON_OBJECT('mots', JSON_ARRAY('fan',   'van')),
      JSON_OBJECT('mots', JSON_ARRAY('fond',  'vont')),
      JSON_OBJECT('mots', JSON_ARRAY('feu',   'vœu')),
      JSON_OBJECT('mots', JSON_ARRAY('sou',   'zou')),
      JSON_OBJECT('mots', JSON_ARRAY('seau',  'zoo')),
      JSON_OBJECT('mots', JSON_ARRAY('chaud', 'jeu'))
    )
  )
),

-- ── A9. Paires minimales — lieu d'articulation des occlusives (inspiré Exercice 3.15) ──
(
  'Lieu d''articulation : bilabiale, dentale, vélaire',
  'difficile',
  'Distinguez [p/t/k] et [b/d/g]. Seul le lieu d''articulation change.',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des trois mots. Indiquez lequel.',
    'consigne_partenaire', 'Les trois mots ne diffèrent que par le lieu d''articulation de la consonne.',
    'principe', 'Contraste lieu d''articulation : bilabiale [p/b] — dentale [t/d] — vélaire [k/g]',
    'triplets', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('pain',  'teint',  'kain')),
      JSON_OBJECT('mots', JSON_ARRAY('bas',   'das',    'gaz')),
      JSON_OBJECT('mots', JSON_ARRAY('pont',  'ton',    'con')),
      JSON_OBJECT('mots', JSON_ARRAY('père',  'terre',  'guerre')),
      JSON_OBJECT('mots', JSON_ARRAY('bain',  'daim',   'gain')),
      JSON_OBJECT('mots', JSON_ARRAY('port',  'tort',   'corps')),
      JSON_OBJECT('mots', JSON_ARRAY('part',  'tare',   'car')),
      JSON_OBJECT('mots', JSON_ARRAY('peur',  'teur',   'cœur')),
      JSON_OBJECT('mots', JSON_ARRAY('beau',  'dos',    'goo')),
      JSON_OBJECT('mots', JSON_ARRAY('pic',   'tic',    'quiche'))
    )
  )
),

-- ── A10. Paires minimales — mode d'articulation : occlusive vs fricative (inspiré Exercice 3.19) ──
(
  'Mode d''articulation : [t] contre [s]',
  'difficile',
  'Distinguez l''occlusive dentale [t] de la fricative [s]. Seul le mode d''articulation change.',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''un des deux mots. Indiquez lequel.',
    'consigne_partenaire', '[t] est une occlusive (l''air est bloqué puis relâché). [s] est une fricative (flux d''air continu).',
    'principe', 'Contraste mode d''articulation : occlusive [t] vs fricative [s], même voisement et même lieu',
    'paires', JSON_ARRAY(
      JSON_OBJECT('mots', JSON_ARRAY('tac',  'sac')),
      JSON_OBJECT('mots', JSON_ARRAY('toi',  'soie')),
      JSON_OBJECT('mots', JSON_ARRAY('ton',  'son')),
      JSON_OBJECT('mots', JSON_ARRAY('tout',  'soûl')),
      JSON_OBJECT('mots', JSON_ARRAY('tu',   'su')),
      JSON_OBJECT('mots', JSON_ARRAY('thé',  'ces')),
      JSON_OBJECT('mots', JSON_ARRAY('tir',  'sir')),
      JSON_OBJECT('mots', JSON_ARRAY('telle', 'sel')),
      JSON_OBJECT('mots', JSON_ARRAY('temps', 'sans')),
      JSON_OBJECT('mots', JSON_ARRAY('tôt',  'sot')),
      JSON_OBJECT('mots', JSON_ARRAY('tante', 'sente')),
      JSON_OBJECT('mots', JSON_ARRAY('taille', 'saille'))
    )
  )
);

-- ── A11. Discrimination haute vs basse fréquence — mots (inspiré Exercice 4.0) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Phrases riches en sons aigus ou graves',
  'moyen',
  'Identifiez la phrase prononcée. Les phrases A contiennent des sons aigus (fricatives), les B des sons graves (nasales, voyelles ouvertes).',
  '', 5, 'distinguer',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit une phrase A ou B. Indiquez laquelle.',
    'consigne_partenaire', 'Dites l''une des deux phrases sans montrer votre visage si possible. L''auditeur voit les deux options écrites.',
    'principe', 'Contraste fréquentiel : phrases riches en fricatives et sibilantes (hautes fréquences) vs phrases riches en nasales et voyelles ouvertes (basses fréquences)',
    'paires', JSON_ARRAY(
      JSON_OBJECT('A_aigu', 'Ses chaussettes sont sèches.',         'B_grave', 'Mon bon ami vient demain.'),
      JSON_OBJECT('A_aigu', 'Six saucisses sèchent sur le sol.',    'B_grave', 'La lune brille dans le ciel noir.'),
      JSON_OBJECT('A_aigu', 'Zoé choisit ses vêtements seule.',     'B_grave', 'Mon grand frère aime la montagne.'),
      JSON_OBJECT('A_aigu', 'Ce sac est si léger.',                 'B_grave', 'Viens donc voir ma grand-mère.'),
      JSON_OBJECT('A_aigu', 'La sœur de Cécile s''est perdue.',     'B_grave', 'Mon voisin promène son grand chien.'),
      JSON_OBJECT('A_aigu', 'C''est si facile de réussir.',         'B_grave', 'Un bon bain chaud, ça fait du bien.'),
      JSON_OBJECT('A_aigu', 'Ces chaussures sont usées.',           'B_grave', 'Maman range les valises là-haut.'),
      JSON_OBJECT('A_aigu', 'Elle choisit souvent ce chemin-ci.',   'B_grave', 'Mon grand ami mange très bien.')
    )
  )
);

-- ── A12. Accentuation de phrase (inspiré Exercice 2.0) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Quel mot est accentué ?',
  'moyen',
  'En français, on peut insister sur un mot pour changer le sens. Identifiez le mot sur lequel votre partenaire a mis l''emphase.',
  '', 3, 'percevoir',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit une phrase en insistant sur un mot différent à chaque fois. Indiquez quel mot vous semblez avoir entendu avec plus d''intensité ou de durée.',
    'consigne_partenaire', 'Lisez la phrase en exagérant l''accent d''intensité sur le mot indiqué par le numéro choisi.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('phrase', 'Tu as pris mon stylo.',     'mots_cles', JSON_ARRAY('Tu', 'pris', 'mon', 'stylo')),
      JSON_OBJECT('phrase', 'Elle est déjà partie.',     'mots_cles', JSON_ARRAY('Elle', 'déjà', 'partie')),
      JSON_OBJECT('phrase', 'Je veux du café chaud.',    'mots_cles', JSON_ARRAY('Je', 'veux', 'café', 'chaud')),
      JSON_OBJECT('phrase', 'Il n''a pas répondu.',      'mots_cles', JSON_ARRAY('Il', 'pas', 'répondu')),
      JSON_OBJECT('phrase', 'Nous partons ce soir.',     'mots_cles', JSON_ARRAY('Nous', 'partons', 'soir')),
      JSON_OBJECT('phrase', 'C''est vraiment trop tard.','mots_cles', JSON_ARRAY('vraiment', 'trop', 'tard')),
      JSON_OBJECT('phrase', 'Donne-moi ça maintenant.',  'mots_cles', JSON_ARRAY('Donne', 'ça', 'maintenant')),
      JSON_OBJECT('phrase', 'Tu as dit que tu venais.',  'mots_cles', JSON_ARRAY('Tu', 'dit', 'tu', 'venais'))
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- SECTION B — ENTRAÎNEMENT SYNTHÉTIQUE
-- ═══════════════════════════════════════════════════════

-- ── B1. Formules routinières à identifier (inspiré Exercice 5.0 / paramètres fermés) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Formules de tous les jours',
  'facile',
  'Votre partenaire dit une formule très courante. Identifiez laquelle parmi les options.',
  '', 4, 'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit l''une des formules. Indiquez laquelle vous avez reconnue.',
    'consigne_partenaire', 'Choisissez une formule parmi le groupe et dites-la clairement. Maximum 3 tentatives avant d''aider.',
    'groupes', JSON_ARRAY(
      JSON_ARRAY('Bonjour !',          'Bonsoir.',         'Bonne nuit.',         'Salut !'),
      JSON_ARRAY('Comment ça va ?',    'Ça va bien.',      'Pas trop mal.',       'Ça va très bien, merci.'),
      JSON_ARRAY('S''il vous plaît.',  'Merci beaucoup.', 'Je vous en prie.',    'De rien.'),
      JSON_ARRAY('Pardon ?',           'Excusez-moi.',     'Je n''ai pas compris.','Pouvez-vous répéter ?'),
      JSON_ARRAY('Oui, bien sûr.',     'Non, merci.',      'Peut-être.',          'Je ne sais pas.'),
      JSON_ARRAY('C''est combien ?',   'C''est cher.',     'Avez-vous la monnaie ?','Je paie par carte.'),
      JSON_ARRAY('À quelle heure ?',   'Quand est-ce ?',   'C''est pour quand ?', 'Quel jour sommes-nous ?'),
      JSON_ARRAY('Où sont les toilettes ?','C''est par là.','Tournez à gauche.','C''est tout droit.')
    )
  )
),

-- ── B2. Phrases avec indice thématique — télévision (inspiré Exercice 3.0 synthétique) ──
(
  'Sujet : La télévision',
  'moyen',
  'Votre partenaire dit des phrases sur le thème de la télévision. Répétez ou identifiez chaque phrase.',
  '', 8, 'themes',
  JSON_OBJECT(
    'instructions', 'Votre partenaire annonce le thème "Télévision", puis dit des phrases sur ce sujet. Répétez chaque phrase.',
    'consigne_partenaire', 'Annoncez le thème. Dites chaque phrase une fois. Si l''auditeur ne comprend pas en 3 essais, donnez le mot souligné comme indice.',
    'theme', 'Télévision',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('phrase', 'Qu''est-ce que tu regardes ?',           'mot_cle', 'regardes'),
      JSON_OBJECT('phrase', 'Allume la télévision.',                  'mot_cle', 'télévision'),
      JSON_OBJECT('phrase', 'Je déteste les publicités.',             'mot_cle', 'publicités'),
      JSON_OBJECT('phrase', 'Il y a un bon film ce soir.',            'mot_cle', 'film'),
      JSON_OBJECT('phrase', 'Quel est l''acteur principal ?',         'mot_cle', 'acteur'),
      JSON_OBJECT('phrase', 'Passe-moi la télécommande.',             'mot_cle', 'télécommande'),
      JSON_OBJECT('phrase', 'Le journal télévisé commence à vingt heures.', 'mot_cle', 'journal'),
      JSON_OBJECT('phrase', 'Change de chaîne, s''il te plaît.',      'mot_cle', 'chaîne'),
      JSON_OBJECT('phrase', 'Cette émission est vraiment intéressante.', 'mot_cle', 'émission'),
      JSON_OBJECT('phrase', 'Baisses le volume un peu.',              'mot_cle', 'volume')
    )
  )
),

-- ── B3. Phrases avec indice thématique — nourriture ──
(
  'Sujet : La nourriture',
  'moyen',
  'Votre partenaire dit des phrases sur le thème de la nourriture. Répétez ou identifiez chaque phrase.',
  '', 8, 'themes',
  JSON_OBJECT(
    'instructions', 'Votre partenaire annonce le thème "Nourriture", puis dit des phrases sur ce sujet. Répétez chaque phrase.',
    'consigne_partenaire', 'Annoncez le thème. En cas d''échec après 3 essais, donnez le mot-clé souligné.',
    'theme', 'Nourriture',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('phrase', 'J''ai très faim.',                          'mot_cle', 'faim'),
      JSON_OBJECT('phrase', 'Qu''est-ce qu''on mange ce soir ?',         'mot_cle', 'mange'),
      JSON_OBJECT('phrase', 'Le dîner est prêt.',                        'mot_cle', 'dîner'),
      JSON_OBJECT('phrase', 'Tu veux encore de la soupe ?',              'mot_cle', 'soupe'),
      JSON_OBJECT('phrase', 'Ce pain est très frais.',                   'mot_cle', 'pain'),
      JSON_OBJECT('phrase', 'Je voudrais un café, s''il vous plaît.',    'mot_cle', 'café'),
      JSON_OBJECT('phrase', 'Cette tarte est délicieuse.',               'mot_cle', 'tarte'),
      JSON_OBJECT('phrase', 'Passe-moi le sel et le poivre.',            'mot_cle', 'sel'),
      JSON_OBJECT('phrase', 'Il n''y a plus de beurre dans le réfrigérateur.', 'mot_cle', 'beurre'),
      JSON_OBJECT('phrase', 'On mange au restaurant ce midi ?',          'mot_cle', 'restaurant')
    )
  )
),

-- ── B4. Phrases avec indice thématique — santé (inspiré Exercice 3.0, topic C) ──
(
  'Sujet : La santé',
  'difficile',
  'Votre partenaire dit des phrases sur le thème de la santé. Répétez chaque phrase sans voir le texte.',
  '', 8, 'themes',
  JSON_OBJECT(
    'instructions', 'Votre partenaire annonce le thème "Santé" et dit des phrases. Répétez sans regarder.',
    'consigne_partenaire', 'L''auditeur ne voit PAS les phrases écrites. Dites chaque phrase naturellement. 3 essais max puis mot-clé.',
    'theme', 'Santé',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('phrase', 'J''ai un rendez-vous chez le médecin.',         'mot_cle', 'médecin'),
      JSON_OBJECT('phrase', 'Je me sens vraiment fatigué.',                  'mot_cle', 'fatigué'),
      JSON_OBJECT('phrase', 'Il faut prendre ce médicament trois fois par jour.', 'mot_cle', 'médicament'),
      JSON_OBJECT('phrase', 'Est-ce que tu as de l''aspirine ?',             'mot_cle', 'aspirine'),
      JSON_OBJECT('phrase', 'Mon dos me fait vraiment mal.',                 'mot_cle', 'dos'),
      JSON_OBJECT('phrase', 'Je dois aller aux urgences.',                   'mot_cle', 'urgences'),
      JSON_OBJECT('phrase', 'Le docteur m''a prescrit un traitement.',       'mot_cle', 'traitement'),
      JSON_OBJECT('phrase', 'Je tosse depuis plusieurs jours.',              'mot_cle', 'tosse'),
      JSON_OBJECT('phrase', 'Il faut se reposer.',                           'mot_cle', 'reposer'),
      JSON_OBJECT('phrase', 'Avez-vous de la fièvre ?',                      'mot_cle', 'fièvre')
    )
  )
),

-- ── B5. Contexte de conversation — questions personnelles (inspiré Exercice 4.0) ──
(
  'Questions sur votre quotidien',
  'moyen',
  'Votre partenaire vous pose des questions sur votre vie quotidienne dans différents contextes.',
  '', 6, 'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous pose des questions. Répétez la question entendue, puis répondez.',
    'consigne_partenaire', 'Annoncez chaque sous-thème, puis posez les questions. L''auditeur répète puis répond.',
    'groupes', JSON_ARRAY(
      JSON_OBJECT(
        'contexte', 'Questions sur vous',
        'questions', JSON_ARRAY(
          'Comment vous appelez-vous ?',
          'Quel est votre âge ?',
          'Êtes-vous marié(e) ou célibataire ?',
          'Combien avez-vous d''enfants ?',
          'Quel est votre métier ?'
        )
      ),
      JSON_OBJECT(
        'contexte', 'Questions sur votre maison',
        'questions', JSON_ARRAY(
          'Où habitez-vous ?',
          'Vous vivez dans une maison ou un appartement ?',
          'Avez-vous un grand jardin ?',
          'C''est loin d''ici ?',
          'Depuis combien de temps vivez-vous là ?'
        )
      ),
      JSON_OBJECT(
        'contexte', 'Questions sur vos préférences',
        'questions', JSON_ARRAY(
          'Vous aimez regarder la télévision ?',
          'Quelle est votre couleur préférée ?',
          'Vous préférez le café ou le thé ?',
          'Qu''est-ce que vous faites le week-end ?',
          'Quel est votre plat préféré ?'
        )
      )
    )
  )
),

-- ── B6. Compléter la phrase — choix fermé (inspiré Exercice 1.0 fill-in) ──
(
  'Complétez la phrase (choix visible)',
  'moyen',
  'Votre partenaire lit une phrase avec un mot-clé. Identifiez le bon mot parmi les options visibles.',
  '', 6, 'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire lit la phrase complète. Indiquez quel mot de la liste a été prononcé.',
    'consigne_partenaire', 'Choisissez une des options pour chaque phrase et lisez la phrase complète. L''auditeur voit les options mais pas la phrase entière.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('debut', 'Si tu as froid, mets ton ______.',        'options', JSON_ARRAY('manteau', 'pull', 'gilet')),
      JSON_OBJECT('debut', 'J''ai acheté du lait au ______.',         'options', JSON_ARRAY('supermarché', 'marché', 'magasin')),
      JSON_OBJECT('debut', 'Est-ce que tu as lu le ______ ce matin ?','options', JSON_ARRAY('journal', 'livre', 'magazine')),
      JSON_OBJECT('debut', 'Je suis allé au cinéma ______.',          'options', JSON_ARRAY('hier soir', 'la semaine dernière', 'samedi')),
      JSON_OBJECT('debut', 'Elle a mis les fleurs dans le ______.',   'options', JSON_ARRAY('vase', 'verre', 'jardin')),
      JSON_OBJECT('debut', 'Ouvre la ______ pour faire entrer l''air.','options', JSON_ARRAY('fenêtre', 'porte', 'voiture')),
      JSON_OBJECT('debut', 'Le boulanger a vendu le ______ au client.','options', JSON_ARRAY('pain', 'gâteau', 'croissant')),
      JSON_OBJECT('debut', 'Il a collé un ______ sur l''enveloppe.',  'options', JSON_ARRAY('timbre', 'autocollant', 'étiquette')),
      JSON_OBJECT('debut', 'Nous partons en vacances au ______.',     'options', JSON_ARRAY('bord de la mer', 'ski', 'camping')),
      JSON_OBJECT('debut', 'Elle travaille à l''______.',             'options', JSON_ARRAY('hôpital', 'école', 'usine'))
    )
  )
),

-- ── B7. Compléter la phrase — open set (inspiré Exercice 1.1) ──
(
  'Complétez la phrase (sans indices)',
  'difficile',
  'Votre partenaire lit une phrase complète. Répétez le mot manquant sans voir les options.',
  '', 6, 'comprendre',
  JSON_OBJECT(
    'instructions', 'Vous voyez la phrase avec un blanc. Votre partenaire dit la phrase complète. Répétez le mot manquant.',
    'consigne_partenaire', 'L''auditeur voit seulement la phrase avec le blanc. Lisez la phrase entière naturellement.',
    'phrases', JSON_ARRAY(
      JSON_OBJECT('visible', 'Si tu as froid, mets ton ______.', 'complet', 'Si tu as froid, mets ton manteau.', 'reponse', 'manteau'),
      JSON_OBJECT('visible', 'J''ai acheté du lait au ______.', 'complet', 'J''ai acheté du lait au supermarché.', 'reponse', 'supermarché'),
      JSON_OBJECT('visible', 'Est-ce que tu as lu le ______ ce matin ?', 'complet', 'Est-ce que tu as lu le journal ce matin ?', 'reponse', 'journal'),
      JSON_OBJECT('visible', 'Elle a mis les fleurs dans le ______.', 'complet', 'Elle a mis les fleurs dans le vase.', 'reponse', 'vase'),
      JSON_OBJECT('visible', 'Ouvre la ______ pour faire entrer l''air.', 'complet', 'Ouvre la fenêtre pour faire entrer l''air.', 'reponse', 'fenêtre'),
      JSON_OBJECT('visible', 'Il a collé un ______ sur l''enveloppe.', 'complet', 'Il a collé un timbre sur l''enveloppe.', 'reponse', 'timbre'),
      JSON_OBJECT('visible', 'Nous partons en vacances au ______.', 'complet', 'Nous partons en vacances au bord de la mer.', 'reponse', 'bord de la mer'),
      JSON_OBJECT('visible', 'Le médecin m''a prescrit un ______.', 'complet', 'Le médecin m''a prescrit un médicament.', 'reponse', 'médicament'),
      JSON_OBJECT('visible', 'Le train a une heure de ______.', 'complet', 'Le train a une heure de retard.', 'reponse', 'retard'),
      JSON_OBJECT('visible', 'Les enfants jouent dans le ______.', 'complet', 'Les enfants jouent dans le jardin.', 'reponse', 'jardin')
    )
  )
);

-- ── B8. Histoires interactives — facile (inspiré Exercice 10.0) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Histoire : Le petit déjeuner',
  'moyen',
  'Votre partenaire vous lit un court texte sur le petit déjeuner. Répondez ensuite aux questions.',
  '', 6, 'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous lit le texte à voix haute sans vous montrer le livre. Répondez ensuite aux questions.',
    'consigne_partenaire', 'Lisez le texte lentement et clairement. L''auditeur ne voit pas le texte. Posez ensuite les questions une par une.',
    'texte', 'Le petit déjeuner est probablement le repas le plus important de la journée. Il nous donne l''énergie nécessaire pour passer la matinée. En France, beaucoup de gens mangent du pain avec du beurre et de la confiture. D''autres préfèrent des céréales avec du lait. Certains aiment les croissants ou les pains au chocolat du boulanger. La plupart des adultes boivent du café ou du thé. Les enfants préfèrent souvent le jus d''orange. Un bon petit déjeuner devrait contenir des protéines, des glucides et des vitamines.',
    'questions', JSON_ARRAY(
      JSON_OBJECT('q', 'De quoi parlais-je ?',                        'type', 'sujet'),
      JSON_OBJECT('q', 'Pourquoi le petit déjeuner est-il important ?','type', 'rappel'),
      JSON_OBJECT('q', 'Que mangent beaucoup de Français ?',          'type', 'rappel'),
      JSON_OBJECT('q', 'Que boivent les enfants en général ?',        'type', 'rappel'),
      JSON_OBJECT('q', 'Et vous, que prenez-vous au petit déjeuner ?','type', 'personnel')
    )
  )
),

-- ── B9. Histoire — niveau intermédiaire (inspiré Exercice 10.1) ──
(
  'Histoire : Le chat et l''oiseau',
  'difficile',
  'Votre partenaire vous lit une histoire narrative. Répondez ensuite aux questions précises.',
  '', 6, 'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous lit l''histoire. Essayez de retenir les détails. Répondez ensuite sans aide.',
    'consigne_partenaire', 'Lisez l''histoire d''une traite. Posez les questions sans relire le texte.',
    'texte', 'Un après-midi d''été, un gros chat roux était couché sur le rebord d''une fenêtre. Il regardait le jardin d''un œil à moitié fermé. Soudain, il aperçut un petit oiseau jaune posé sur une branche basse du pommier. L''oiseau chantait sans se méfier. Le chat se redressa lentement, descendit du rebord avec précaution, et se faufila entre les buissons. Il s''approcha tout doucement, centimètre par centimètre. Mais au moment où il allait bondir, l''oiseau l''aperçut et s''envola. Le chat sauta dans le vide et tomba dans le bassin du jardin. Il rentra à la maison, furieux et tout mouillé, et ne quitta plus son coussin de toute la journée.',
    'questions', JSON_ARRAY(
      JSON_OBJECT('q', 'De quelle couleur était le chat ?',          'reponse', 'roux'),
      JSON_OBJECT('q', 'Où était-il couché ?',                       'reponse', 'sur le rebord d''une fenêtre'),
      JSON_OBJECT('q', 'De quelle couleur était l''oiseau ?',        'reponse', 'jaune'),
      JSON_OBJECT('q', 'Sur quoi l''oiseau était-il posé ?',         'reponse', 'une branche basse du pommier'),
      JSON_OBJECT('q', 'Est-ce que le chat a attrapé l''oiseau ?',   'reponse', 'non'),
      JSON_OBJECT('q', 'Où est-il tombé ?',                          'reponse', 'dans le bassin du jardin'),
      JSON_OBJECT('q', 'Qu''a-t-il fait en rentrant ?',              'reponse', 'il n''a plus quitté son coussin')
    )
  )
),

-- ── B10. Histoire — niveau avancé (inspiré Exercice 10.2) ──
(
  'Histoire : Le Mont-Saint-Michel',
  'difficile',
  'Votre partenaire vous lit un texte informatif sur le Mont-Saint-Michel. Répondez aux questions.',
  '', 6, 'comprendre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire vous lit le texte sans vous montrer le livre. Répondez ensuite aux questions.',
    'consigne_partenaire', 'Lisez le texte lentement. Posez les questions sans relire. Si nécessaire, relisez UNE seule phrase.',
    'texte', 'Le Mont-Saint-Michel est l''un des sites les plus visités de France. Il se trouve en Normandie, à la frontière de la Bretagne, dans une baie célèbre pour ses marées exceptionnelles. L''abbaye bénédictine qui le surmonte a été fondée au VIIIe siècle. Pendant des siècles, des milliers de pèlerins ont traversé la baie à pied pour visiter le sanctuaire. Ce chemin était dangereux car la mer monte très vite dans la baie — parfois à la vitesse d''un cheval au galop. Aujourd''hui, plus de trois millions de visiteurs viennent chaque année admirer ce rocher granitique et son abbaye gothique. Depuis 2014, une passerelle piétonne remplace l''ancienne route submersible, et le mont est redevenu une île à marée haute.',
    'questions', JSON_ARRAY(
      JSON_OBJECT('q', 'Où se trouve le Mont-Saint-Michel ?',                     'reponse', 'en Normandie, à la frontière de la Bretagne'),
      JSON_OBJECT('q', 'Quand l''abbaye a-t-elle été fondée ?',                  'reponse', 'au VIIIe siècle'),
      JSON_OBJECT('q', 'Pourquoi la traversée à pied était-elle dangereuse ?',   'reponse', 'la mer monte très vite'),
      JSON_OBJECT('q', 'Combien de visiteurs viennent chaque année ?',           'reponse', 'plus de trois millions'),
      JSON_OBJECT('q', 'Qu''est-ce qui a changé depuis 2014 ?',                  'reponse', 'une passerelle piétonne a été construite'),
      JSON_OBJECT('q', 'Voudriez-vous y aller ? Pourquoi ?',                     'type', 'personnel')
    )
  )
);

-- ── B11. Phrases en open-set — facile (inspiré Exercice 9.0, Set A) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Phrases libres courtes (5-7 mots)',
  'moyen',
  'Votre partenaire dit des phrases courtes sans aucun indice. Répétez chaque phrase entendue.',
  '', 4, 'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit une phrase. Répétez-la sans aide. 3 essais maximum, puis votre partenaire peut donner un indice.',
    'consigne_partenaire', 'Dites chaque phrase sans que l''auditeur voie le texte. Si 3 tentatives échouent : donnez d''abord le sujet général, puis le premier mot.',
    'phrases', JSON_ARRAY(
      'J''ai mis mon argent à la banque.',
      'Elle est malade, appelez le médecin.',
      'Il fait froid ce matin.',
      'Mets tes chaussures avant de sortir.',
      'Le rouge et le bleu font du violet.',
      'Les oiseaux volent haut dans le ciel.',
      'Ferme la porte derrière toi.',
      'Je rentre à la maison ce soir.',
      'Peux-tu m''aider s''il te plaît ?',
      'Il est déjà midi.'
    )
  )
),

-- ── B12. Phrases en open-set — difficile (inspiré Exercice 9.0, Set C) ──
(
  'Phrases libres longues (8-12 mots)',
  'difficile',
  'Votre partenaire dit des phrases plus longues sans aucun indice. Répétez chaque phrase.',
  '', 4, 'reconnaitre',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit une phrase longue. Répétez-la le plus fidèlement possible.',
    'consigne_partenaire', 'Ces phrases sont longues et sans indice thématique. C''est la condition la plus difficile. Soyez patient(e).',
    'phrases', JSON_ARRAY(
      'La pluie a duré toute la journée sans s''arrêter.',
      'Les adolescents adorent passer du temps sur leur téléphone.',
      'Il a garé la voiture devant le supermarché du quartier.',
      'Je n''ai pas assez d''argent pour acheter ce manteau.',
      'La cuisine a besoin d''une nouvelle table et de quelques chaises.',
      'Elle a bu un verre de lait chaud avant d''aller se coucher.',
      'Ils ont emprunté de l''argent à la banque pour acheter leur maison.',
      'Il faisait encore nuit quand je me suis réveillé ce matin.',
      'Nous avons passé de très belles vacances au bord de la mer.',
      'Son père a posé le livre sur la table de nuit avant d''éteindre la lumière.'
    )
  )
);

-- ═══════════════════════════════════════════════════════
-- SECTION C — THÉRAPIE DE LA COMMUNICATION
-- ═══════════════════════════════════════════════════════

-- ── C1. Formules surappris — open set (inspiré Exercice 5.0 overlearned) ──
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice, contenu) VALUES
(
  'Expressions très familières',
  'facile',
  'Ces expressions sont tellement connues que le contexte aide beaucoup. Répétez chaque expression entendue.',
  '', 7, 'memoriser',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit une expression courante. Répétez-la exactement.',
    'consigne_partenaire', 'Ces formules sont si fréquentes que l''auditeur les connaît parfaitement. Dites-les naturellement, sans les souligner.',
    'expressions', JSON_ARRAY(
      'C''est pour vous.',
      'Qui est-ce ?',
      'Gardez ça à l''esprit.',
      'Allez-y.',
      'Je suis en train de...',
      'Entrez !',
      'En fait...',
      'Après réflexion...',
      'Pas du tout.',
      'Et alors ?',
      'Pas maintenant.',
      'On y va ?',
      'Vous savez ?',
      'C''est mon stylo ?',
      'Très bien, merci.',
      'D''accord.',
      'Comment pouvez-vous ?',
      'On part quand ?',
      'Que faire ?',
      'C''est bon.',
      'Vraiment ?',
      'Bien sûr.',
      'Aucun problème.',
      'On verra.',
      'Ça dépend.',
      'Je vous laisse.',
      'À bientôt !',
      'Bonne journée !',
      'Bonne chance !',
      'Prenez soin de vous.'
    )
  )
),

-- ── C2. Contexte de question-réponse (inspiré Exercice 3.0 de prédictabilité) ──
(
  'Prédire la réponse grâce au contexte',
  'moyen',
  'Votre partenaire lit une question qui vous aide à prédire sa réponse. Répétez la réponse entendue.',
  '', 7, 'memoriser',
  JSON_OBJECT(
    'instructions', 'Vous lisez la question à votre partenaire. Il vous répond. Répétez sa réponse.',
    'consigne_partenaire', 'L''auditeur lit la question, vous répondez avec la réponse de droite. Si l''auditeur se trompe : répétez, puis accentuez le mot souligné, puis donnez un indice.',
    'paires', JSON_ARRAY(
      JSON_OBJECT('question', 'Pourquoi tu ne dors pas ?',                'reponse', 'Je fais des cauchemars depuis quelques jours.',            'mot_cle', 'cauchemars'),
      JSON_OBJECT('question', 'Pourquoi tu mets un imperméable ?',        'reponse', 'Parce qu''il va pleuvoir cet après-midi.',                  'mot_cle', 'pleuvoir'),
      JSON_OBJECT('question', 'Pourquoi vous partez si tôt ?',            'reponse', 'On a un train à prendre à six heures du matin.',            'mot_cle', 'train'),
      JSON_OBJECT('question', 'Pourquoi tu cherches tes lunettes ?',      'reponse', 'Je ne les ai pas trouvées depuis hier soir.',               'mot_cle', 'lunettes'),
      JSON_OBJECT('question', 'Pourquoi tu cuisines autant ?',            'reponse', 'On attend des amis à dîner ce soir.',                       'mot_cle', 'amis'),
      JSON_OBJECT('question', 'Pourquoi tu n''as pas de voiture ?',       'reponse', 'Je n''ai jamais passé le permis de conduire.',              'mot_cle', 'permis'),
      JSON_OBJECT('question', 'Pourquoi vous riez ?',                     'reponse', 'Il vient de raconter une blague vraiment drôle.',           'mot_cle', 'blague'),
      JSON_OBJECT('question', 'Pourquoi tu portes des gants en été ?',    'reponse', 'Mes mains sont très sensibles au soleil.',                  'mot_cle', 'sensibles'),
      JSON_OBJECT('question', 'Pourquoi tu appelles le médecin ?',        'reponse', 'Ma fille a de la fièvre depuis deux jours.',                'mot_cle', 'fièvre'),
      JSON_OBJECT('question', 'Pourquoi tu gardes ces vieux journaux ?',  'reponse', 'Il y a des articles importants que je veux relire.',        'mot_cle', 'articles')
    )
  )
),

-- ── C3. Conversation ouverte guidée (inspiré Exercice 5.0 Quest?ar) ──
(
  'Racontez-moi un voyage',
  'difficile',
  'Votre partenaire vous pose des questions sur un voyage que vous avez fait. Répondez librement. Exercice de conversation ouverte.',
  '', 7, 'memoriser',
  JSON_OBJECT(
    'instructions', 'Pensez à un voyage que vous avez fait. Votre partenaire vous pose des questions. Répondez librement. Si vous ne comprenez pas une question, demandez de répéter.',
    'consigne_partenaire', 'L''auditeur pense à un voyage. Posez les questions dans l''ordre. Répétez si nécessaire. Reformulez si l''auditeur ne comprend pas.',
    'questions', JSON_ARRAY(
      'Où êtes-vous allé(e) ?',
      'Pourquoi avez-vous choisi cet endroit ?',
      'Quand est-ce que vous y êtes allé(e) ?',
      'Vous y êtes allé(e) seul(e) ou avec quelqu''un ?',
      'Avec qui ?',
      'Comment avez-vous voyagé ?',
      'Combien de temps le voyage a-t-il duré ?',
      'Où avez-vous dormi ?',
      'Qu''est-ce que vous avez vu en route ?',
      'Quelle était la première chose que vous avez faite en arrivant ?',
      'Qu''est-ce que vous avez visité ?',
      'Qu''est-ce que vous avez mangé de particulier ?',
      'Qu''est-ce qui vous a le plus surpris ?',
      'Avez-vous acheté des souvenirs ?',
      'Combien ça a coûté environ ?',
      'Est-il arrivé quelque chose d''inattendu ?',
      'Quel est votre plus beau souvenir de ce voyage ?',
      'Y retourneriez-vous ?',
      'Vous me le recommandez ? Pourquoi ?'
    )
  )
),

-- ── C4. Suivi de texte (inspiré Exercice 6.0 text tracking) ──
(
  'Suivez le texte : L''ours et le chasseur',
  'moyen',
  'Votre partenaire lit un texte pendant que vous suivez chaque mot du doigt. Il s''arrête à des moments aléatoires. Répétez le dernier mot.',
  '', 7, 'memoriser',
  JSON_OBJECT(
    'instructions', 'Vous avez le texte sous les yeux. Votre partenaire le lit à voix haute. Suivez chaque mot du doigt. Quand il s''arrête, répétez le dernier mot qu''il a dit.',
    'consigne_partenaire', 'Lisez le texte à voix haute à un rythme naturel. Arrêtez-vous au moins 6 fois à des endroits variés (pas toujours à la fin d''une phrase). L''auditeur doit répéter le dernier mot.',
    'texte', 'Un vieux chasseur marchait dans la forêt par un matin d''hiver. La neige recouvrait les sentiers et les arbres craquaient sous le froid. Soudain, il aperçut des empreintes énormes dans la neige fraîche. Son cœur battit plus vite. Ces empreintes appartenaient à un ours, et elles étaient très récentes. Le chasseur suivit la piste pendant plusieurs minutes. Elle le conduisit jusqu''à une grotte obscure au pied d''une grande falaise. Il s''approcha doucement, le souffle retenu. À l''intérieur, il entendit un souffle profond et régulier. L''ours dormait encore. Le chasseur sourit, rebroussa chemin sans faire de bruit, et rentra chez lui se réchauffer au coin du feu. Il décida de raconter son aventure à ses petits-enfants le soir même.',
    'points_arret_suggeres', JSON_ARRAY('hiver', 'froid', 'neige fraîche', 'minutes', 'obscure', 'régulier', 'bruit', 'même')
  )
),

-- ── C5. Types de questions (inspiré Exercice 4.0 Asque) ──
(
  'Quel type de réponse attendez-vous ?',
  'difficile',
  'Votre partenaire vous pose différents types de questions. Identifiez d''abord le type de question, puis répondez.',
  '', 7, 'memoriser',
  JSON_OBJECT(
    'instructions', 'Votre partenaire dit une phrase ou une question. Répétez-la, identifiez son type, puis répondez ou réagissez.',
    'consigne_partenaire', 'Dites chaque phrase ou question. L''auditeur répète, dit le type, et répond. Si l''auditeur se trompe de type, expliquez la différence.',
    'categories', JSON_OBJECT(
      'oui_non', JSON_ARRAY(
        'Vous savez jouer aux échecs ?',
        'Êtes-vous végétarien(ne) ?',
        'Avez-vous assisté à un mariage récemment ?',
        'Aimez-vous chanter ?',
        'Mangez-vous des olives ?'
      ),
      'choix_limite', JSON_ARRAY(
        'Je mets une pomme ou une banane dans votre sac ?',
        'Vous avez réparé la toiture ou elle coule encore ?',
        'C''est pour aujourd''hui ou pour demain ?',
        'Vous préférez le train ou la voiture ?'
      ),
      'reponse_precise', JSON_ARRAY(
        'Combien de pièces avez-vous dans votre porte-monnaie ?',
        'À quelle heure est notre rendez-vous demain ?',
        'Quelle chaîne regardez-vous en général le soir ?'
      ),
      'reponse_ouverte', JSON_ARRAY(
        'Comment pourrait-on améliorer les transports en commun ici ?',
        'Pourquoi est-ce votre ville préférée ?',
        'Que pensez-vous du camping ?'
      ),
      'affirmations', JSON_ARRAY(
        'Ma mère garde toutes ses vieilles cartes de vœux.',
        'Cette chaise n''est pas très confortable.',
        'Certains bébés pleurent toute la nuit.'
      )
    )
  )
);
