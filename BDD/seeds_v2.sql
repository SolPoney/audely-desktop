-- =======================================================
-- SEEDS V2 — Exercices supplémentaires
-- Catégories : 3=Détecter, 4=Reconnaître, 5=Distinguer,
--              6=Comprendre, 7=Mémoriser, 8=Thèmes
-- =======================================================

-- Exercices — Détecter (cat 3)
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  ('Son fort ou faible ?', 'facile', 'Écoutez et déterminez si le son est fort ou faible.', '/audio/fort-faible.mp3', 3, 'detecter'),
  ('Compter les frappes', 'moyen', 'Combien de fois le son est-il répété ? Comptez attentivement.', '/audio/compter-frappes.mp3', 3, 'detecter');

-- Exercices — Reconnaître (cat 4)
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  ('Reconnaître un bruit du quotidien', 'facile', 'Quel bruit de la vie quotidienne entendez-vous ?', '/audio/bruit-quotidien.mp3', 4, 'reconnaitre'),
  ('Reconnaître une consonne', 'moyen', 'Quelle consonne a été prononcée dans cet extrait ?', '/audio/consonne.mp3', 4, 'reconnaitre');

-- Exercices — Distinguer (cat 5)
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  ('Même son ou différent ?', 'facile', 'Écoutez deux sons. Sont-ils identiques ou différents ?', '/audio/meme-different.mp3', 5, 'distinguer'),
  ('Grave ou aigu ? Comparaison', 'facile', 'Deux sons sont joués. Lequel est le plus grave ?', '/audio/grave-aigu-comp.mp3', 5, 'distinguer'),
  ('Deux mots proches', 'moyen', 'Écoutez deux mots similaires. Lesquels entendez-vous ?', '/audio/deux-mots.mp3', 5, 'distinguer'),
  ('Distinguer des syllabes', 'moyen', 'Entendez-vous « pa » ou « ba » ? Distinguez les syllabes proches.', '/audio/syllabes.mp3', 5, 'distinguer'),
  ('Sons similaires', 'difficile', 'Identifiez laquelle de ces quatre syllabes a été prononcée.', '/audio/sons-similaires.mp3', 5, 'distinguer');

-- Exercices — Comprendre (cat 6)
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  ('Compléter une phrase', 'facile', 'Votre partenaire lit une phrase avec un mot manquant. Quel est ce mot ?', '/audio/completer-phrase.mp3', 6, 'comprendre'),
  ('Trouver le mot clé', 'facile', 'Écoutez la phrase et retenez le mot le plus important.', '/audio/mot-cle.mp3', 6, 'comprendre'),
  ('Comprendre une consigne', 'moyen', 'Écoutez la consigne et répondez par l''action demandée.', '/audio/consigne.mp3', 6, 'comprendre'),
  ('Le mot dans son contexte', 'moyen', 'Utilisez le contexte de la phrase pour trouver le mot manquant.', '/audio/mot-contexte.mp3', 6, 'comprendre'),
  ('Comprendre une phrase complexe', 'difficile', 'Écoutez la phrase entière et résumez-la en un mot.', '/audio/phrase-complexe.mp3', 6, 'comprendre');

-- Exercices — Mémoriser (cat 7)
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  ('Retenir une liste courte', 'facile', 'Écoutez trois mots et répétez-les dans le bon ordre.', '/audio/liste-courte.mp3', 7, 'memoriser'),
  ('Mémoriser une séquence de sons', 'facile', 'Écoutez la séquence et reproduisez-la dans le même ordre.', '/audio/sequence-sons.mp3', 7, 'memoriser'),
  ('Retenir les détails', 'moyen', 'Écoutez la description et répondez aux questions sur les détails entendus.', '/audio/details.mp3', 7, 'memoriser'),
  ('Mémoriser une courte histoire', 'moyen', 'Écoutez l''histoire et répondez aux questions.', '/audio/courte-histoire.mp3', 7, 'memoriser'),
  ('Rappel différé', 'difficile', 'Après avoir écouté, attendez 30 secondes puis répondez aux questions.', '/audio/rappel-differe.mp3', 7, 'memoriser');

-- Exercices — Thèmes (cat 8)
INSERT INTO Exercices (titre, niveau, description, audio_url, categorie_id, type_exercice) VALUES
  ('Vocabulaire : les animaux', 'facile', 'Identifiez les animaux mentionnés dans les phrases.', '/audio/theme-animaux.mp3', 8, 'themes'),
  ('Vocabulaire : la maison', 'facile', 'Écoutez et identifiez les pièces et objets de la maison.', '/audio/theme-maison.mp3', 8, 'themes'),
  ('Vocabulaire : les transports', 'moyen', 'Quel moyen de transport est évoqué dans chaque phrase ?', '/audio/theme-transports.mp3', 8, 'themes'),
  ('Vocabulaire : les émotions', 'moyen', 'Identifiez l''émotion exprimée dans chaque énoncé.', '/audio/theme-emotions.mp3', 8, 'themes'),
  ('Vocabulaire : la nourriture', 'moyen', 'Écoutez et retrouvez les aliments mentionnés.', '/audio/theme-nourriture.mp3', 8, 'themes'),
  ('Vocabulaire : le travail', 'difficile', 'Identifiez les métiers et actions professionnelles dans les phrases.', '/audio/theme-travail.mp3', 8, 'themes');
