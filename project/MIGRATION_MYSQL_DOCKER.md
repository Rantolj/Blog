# Migration MySQL vers Docker - Journal des etapes

Date: 2026-03-30

## Objectif
Passer la base de donnees MySQL du projet vers un conteneur Docker, tout en gardant l'application PHP du projet operationnelle.

## Ce qui a ete modifie

1. Fichier `docker-compose.yml` ajoute dans le dossier `project/`.
2. Fichier `db.php` mis a jour pour se connecter au MySQL Docker.
3. Fichier `sql/sql.sql` ajuste pour etre idempotent (`IF NOT EXISTS`).

---

## Detail des modifications

### 1) Ajout de Docker Compose
Fichier cree: `project/docker-compose.yml`

Contenu principal:
- Service `mysql` base sur l'image `mysql:8.0`
- Port mappe: `3307:3306`
- Variables:
  - `MYSQL_ROOT_PASSWORD=root`
  - `MYSQL_DATABASE=blog`
  - `MYSQL_USER=bloguser`
  - `MYSQL_PASSWORD=blogpass`
- Volumes:
  - `mysql_data` pour persistance des donnees
  - `./sql` monte sur `/docker-entrypoint-initdb.d` pour l'initialisation

### 2) Mise a jour de la connexion PHP
Fichier modifie: `project/db.php`

Nouveaux parametres par defaut:
- Host: `127.0.0.1`
- Port: `3307`
- User: `bloguser`
- Password: `blogpass`
- Database: `blog`

La connexion lit aussi des variables d'environnement si elles existent:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`

### 3) Script SQL rendu idempotent
Fichier modifie: `project/sql/sql.sql`

Changements:
- `CREATE DATABASE IF NOT EXISTS blog;`
- `CREATE TABLE IF NOT EXISTS articles (...)`

Cela evite des erreurs si le script est relance.

---

## Etapes pour lancer MySQL Docker

Depuis le dossier `project/`:

```bash
docker compose up -d
```

Verifier que le conteneur tourne:

```bash
docker compose ps
```

Voir les logs si besoin:

```bash
docker compose logs -f mysql
```

Arreter:

```bash
docker compose stop
```

Arreter et supprimer le conteneur:

```bash
docker compose down
```

Arreter, supprimer et reinitialiser aussi les donnees:

```bash
docker compose down -v
```

---

## Verification rapide dans l'application

1. Demarrer Docker: `docker compose up -d`
2. Ouvrir l'application PHP (`index.php` / `create.php`) via ton serveur local.
3. Creer un article.
4. Revenir sur la liste et verifier que l'article est bien enregistre et affiche.

---

## Notes importantes

- Le script SQL dans `sql/` s'execute automatiquement uniquement a la premiere creation du volume MySQL.
- Si tu changes le schema plus tard et que tu veux forcer une reinitialisation complete:
  1. `docker compose down -v`
  2. `docker compose up -d`
