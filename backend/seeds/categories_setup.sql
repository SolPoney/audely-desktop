-- ============================================================
--  Création des catégories + rattachement des exercices
-- ============================================================

-- Catégories (la 1 "Discrimination auditive" existe déjà)
INSERT INTO Categorie (titre) VALUES
  ('Détecter'),
  ('Reconnaître'),
  ('Distinguer'),
  ('Court / Long'),
  ('Comprendre'),
  ('Mémoriser');

-- Rattachement par type_exercice
-- (les IDs dépendent de l'ordre d'insertion ci-dessus : Discrimination=1, Détecter=2, etc.)

UPDATE Exercices SET categorie_id = 2 WHERE type_exercice = 'detecter';
UPDATE Exercices SET categorie_id = 3 WHERE type_exercice = 'reconnaitre_rythme';
UPDATE Exercices SET categorie_id = 4 WHERE type_exercice = 'distinguer';
UPDATE Exercices SET categorie_id = 5 WHERE type_exercice = 'court_moyen_long';
UPDATE Exercices SET categorie_id = 6 WHERE type_exercice = 'comprendre';
-- decision_orthographique reste en catégorie 1 (Discrimination auditive)
