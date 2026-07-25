# Data Dictionary — Audely Desktop

> Database: `audely_desktop` · Engine: InnoDB · Encoding: utf8mb4

---

## Table: `Utilisateur`

Stores registered users. Passwords are never stored in plain text.

| Column | Type | Constraints | Description (EN) |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `nom` | VARCHAR(100) | NOT NULL | User's last name |
| `prenom` | VARCHAR(100) | NOT NULL | User's first name |
| `mail` | VARCHAR(255) | NOT NULL, UNIQUE | Email address — used as login credential |
| `mot_de_passe` | VARCHAR(255) | NOT NULL | Argon2id password hash (never plain text) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |

---

## Table: `Categorie`

Groups exercises by auditory theme (e.g. rhythm, pitch, duration).

| Column | Type | Constraints | Description (EN) |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique category identifier |
| `titre` | VARCHAR(100) | NOT NULL | Category display name |

---

## Table: `Exercices`

Contains all available exercises with their parameters stored as JSON.

| Column | Type | Constraints | Description (EN) |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique exercise identifier |
| `titre` | VARCHAR(150) | NOT NULL | Exercise display title |
| `niveau` | ENUM | NOT NULL — `facile`, `moyen`, `difficile` | Difficulty level |
| `description` | TEXT | NOT NULL | Exercise instructions shown to the user |
| `audio_url` | VARCHAR(255) | NOT NULL | Path or URL to the audio file |
| `categorie_id` | INT | FK → `Categorie(id)`, ON DELETE SET NULL | Category the exercise belongs to (nullable) |
| `type_exercice` | VARCHAR(50) | NOT NULL, DEFAULT `detecter` | Exercise engine type (e.g. `detecter`, `reconnaitre`, `distinguer`) |
| `contenu` | JSON | DEFAULT NULL | Exercise-specific parameters (options, answers, timing…) |

---

## Table: `Resultats`

Records every exercise session completed by a user.

| Column | Type | Constraints | Description (EN) |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique result identifier |
| `id_utilisateur` | INT | NOT NULL, FK → `Utilisateur(id)`, ON DELETE CASCADE | User who completed the exercise |
| `id_exercice` | INT | NOT NULL, FK → `Exercices(id)`, ON DELETE CASCADE | Exercise that was completed |
| `score` | INT | NOT NULL — range 0–100 | Score obtained (percentage of correct answers) |
| `date_session` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Date and time the session was completed |

---

## Table: `Revisions`

Tracks the spaced-repetition schedule (SM-2 algorithm) per user per exercise.

| Column | Type | Constraints | Description (EN) |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique revision record identifier |
| `id_utilisateur` | INT | NOT NULL, FK → `Utilisateur(id)` | User the schedule belongs to |
| `id_exercice` | INT | NOT NULL, FK → `Exercices(id)` | Exercise being scheduled |
| `prochaine_revision` | DATE | NOT NULL | Next date the exercise should be reviewed |
| `intervalle_jours` | INT | NOT NULL, DEFAULT 1 | Current interval in days between reviews |
| `nb_revisions` | INT | NOT NULL, DEFAULT 1 | Total number of times this exercise has been reviewed |

---

## Relationships

```
Utilisateur ──< Resultats >── Exercices
Utilisateur ──< Revisions >── Exercices
Exercices   >── Categorie
```

- A **user** can have many **results** and many **revision records**.
- An **exercise** belongs to one **category** (nullable).
- Deleting a user cascades to their results (GDPR compliance — no orphan data).
