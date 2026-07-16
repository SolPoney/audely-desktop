-- Supprimer les doublons (IDs 8-13)
DELETE FROM Categorie WHERE id IN (8, 9, 10, 11, 12, 13);

-- Ajouter Mémoriser qui manque (ID 7 existe déjà)
-- Vérifier que les exercices "comprendre" pointent vers 6
UPDATE Exercices SET categorie_id = 6 WHERE type_exercice = 'comprendre';
