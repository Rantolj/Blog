# Structure pro du projet PHP

## Arborescence

project/
- app/
  - Controllers/
    - ArticleController.php
- config/
  - database.php
- public/
  - index.php
  - create.php
  - save.php
- database/
  - init/
    - 001_create_articles.sql
- storage/
  - logs/
- docker-compose.yml
- .htaccess
- index.php (compatibilite)
- create.php (compatibilite)
- save.php (compatibilite)

## Roles des dossiers

- `public/`: point d'entree web (pages accessibles par le navigateur).
- `app/`: logique metier/controleurs.
- `config/`: configuration (connexion DB, options app).
- `database/init/`: scripts SQL d'initialisation Docker MySQL.
- `storage/`: fichiers runtime (logs, cache, etc.).

## Pourquoi cette structure est plus professionnelle

- Separation claire des responsabilites (presentation, logique, configuration).
- Meilleure maintenabilite quand le projet grandit.
- Plus proche des conventions des frameworks PHP modernes.
- Plus facile de tester et de deployer.

## Note de compatibilite

Les anciens fichiers racine sont conserves et redirigent vers `public/` pour eviter de casser les URLs existantes.

## URL rewriting

- `project/.htaccess` redirige les routes vers `public/index.php`
- `project/public/.htaccess` transforme l'URL en route interne
