CREATE TABLE Utilisateur (
    id INT AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    mail VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Utilisateur PRIMARY KEY (id)
);

CREATE TABLE Categorie (
    id INT AUTO_INCREMENT,
    titre VARCHAR(100) NOT NULL,
    CONSTRAINT PK_Categorie PRIMARY KEY (id)
);

CREATE TABLE Exercices (
    id INT AUTO_INCREMENT,
    titre VARCHAR(150) NOT NULL,
    niveau ENUM('facile', 'moyen', 'difficile') NOT NULL,
    description TEXT NOT NULL,
    audio_url VARCHAR(255) NOT NULL,
    categorie_id INT,
    CONSTRAINT PK_Exercices PRIMARY KEY (id),
    CONSTRAINT FK_Exercices_Categorie FOREIGN KEY (categorie_id) REFERENCES Categorie(id) ON DELETE SET NULL
);

CREATE TABLE Resultats (
    id INT AUTO_INCREMENT,
    id_utilisateur INT NOT NULL,
    id_exercice INT NOT NULL,
    score INT NOT NULL,
    date_session DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Resultats PRIMARY KEY (id),
    CONSTRAINT FK_Resultats_Utilisateur FOREIGN KEY (id_utilisateur) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    CONSTRAINT FK_Resultats_Exercices FOREIGN KEY (id_exercice) REFERENCES Exercices(id) ON DELETE CASCADE
);