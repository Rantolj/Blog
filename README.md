# Blog — Plateforme de publication d'articles

## Présentation

Blog est une application web PHP destinée à publier et consulter des articles éditoriaux. Elle est organisée autour de deux espaces :

- un **front-office public** pour consulter les articles publiés ;
- un **back-office administrateur** pour créer, modifier, publier et supprimer les articles.

Le projet utilise PHP 8.2, Apache, MySQL 8 et Docker Compose. Il propose également la gestion des images, des URLs propres, des slugs SEO, des métadonnées et un éditeur de contenu TinyMCE.

## État actuel du projet

> État constaté sur la branche `main` le 31 mars 2026.

Le projet dispose déjà d'un socle fonctionnel et peut être considéré comme une **version MVP avancée**.

### Fonctionnalités terminées

- [x] Application PHP avec Apache
- [x] Environnement Docker Compose avec PHP/Apache et MySQL
- [x] Connexion à la base de données avec variables d'environnement
- [x] Création automatique des tables `articles` et `users`
- [x] Authentification administrateur par session
- [x] Création, modification et suppression d'articles
- [x] Gestion des brouillons et des articles publiés
- [x] Front-office affichant les articles publiés
- [x] Pages de détail accessibles avec un slug
- [x] URLs propres et redirections des anciennes routes
- [x] Gestion des images JPG, PNG et WebP
- [x] Compression, redimensionnement et conversion des images en WebP
- [x] Métadonnées SEO : titre, description, slug et texte alternatif
- [x] Éditeur TinyMCE chargé à la demande
- [x] Documentation technique et guides complémentaires
- [x] Améliorations récentes de l'interface et des performances

Les dernières évolutions identifiables dans l'historique concernent notamment l'ajout de la gestion des images, la mise à jour de la documentation technique, l'ajout des auteurs et catégories, le support GD, ainsi que des améliorations de performance et de style CSS. Trois pull requests liées aux fonctionnalités du projet ont été fusionnées dans `main`.

### Travaux recommandés

Le projet n'est toutefois pas encore prêt pour une mise en production sans durcissement complémentaire :

- [ ] Remplacer les identifiants par défaut (`admin/admin123`, `bloguser/blogpass`, etc.)
- [ ] Ajouter une protection CSRF sur les formulaires
- [ ] Ajouter une validation stricte du HTML produit par TinyMCE
- [ ] Vérifier que l'extension PHP GD est bien installée dans l'image Docker
- [ ] Ajouter des tests automatisés
- [ ] Ajouter une pagination, une recherche et éventuellement des catégories côté public
- [ ] Mettre en place HTTPS et une configuration de production séparée
- [ ] Ajouter une gestion plus complète des rôles et des utilisateurs

## Stack technique

- **Langages :** PHP, SQL, HTML et CSS
- **Runtime :** PHP 8.2 avec Apache
- **Base de données :** MySQL 8.0
- **Serveur web :** Apache avec `mod_rewrite`
- **Conteneurisation :** Docker Compose
- **Accès MySQL :** extension PHP `mysqli`
- **Éditeur riche :** TinyMCE chargé depuis un CDN
- **Images :** fonctions GD de PHP, conversion en WebP

## Fonctionnalités

### Front-office public

Le front-office permet d'afficher la liste des articles publiés, de consulter le détail d'un article, d'utiliser des URLs lisibles et d'afficher le résumé, le contenu, la date et l'image d'un article.

| URL | Fonction |
| --- | --- |
| `/capsule` | Liste des articles publiés |
| `/focus/{slug}` | Détail d'un article |
| `/acces-bo` | Connexion au back-office |
| `/atelier` | Gestion des articles |
| `/sortie-bo` | Déconnexion |

### Back-office

L'administrateur peut se connecter, créer et modifier des articles, enregistrer un article comme brouillon ou le publier, définir les champs SEO, importer une image, utiliser TinyMCE et supprimer un article.

### Gestion des images

Les images importées doivent être au format JPG, PNG ou WebP et ne pas dépasser 5 Mo. Elles sont redimensionnées à 1200 pixels de largeur maximum, converties en WebP et stockées dans `project/public/assets/images/`.

## Structure du projet

```text
.
├── README.md
├── guide/
│   └── IMAGE_UPLOAD_GUIDE.md
└── project/
    ├── app/
    │   ├── Controllers/
    │   │   ├── ArticleController.php
    │   │   └── AuthController.php
    │   └── Views/
    │       ├── admin/
    │       ├── errors/
    │       ├── front/
    │       └── partials/
    ├── config/
    │   └── database.php
    ├── database/
    │   └── init/
    │       └── 001_create_articles.sql
    ├── docker/
    │   └── php-apache/
    │       ├── Dockerfile
    │       └── vhost.conf
    ├── guide/
    ├── public/
    │   ├── .htaccess
    │   ├── assets/
    │   ├── create.php
    │   ├── index.php
    │   └── save.php
    ├── sql/
    ├── storage/
    └── docker-compose.yml
```

### Rôle des principaux dossiers

- `project/public/` : point d'entrée web et ressources publiques.
- `project/app/Controllers/` : logique métier des articles et de l'authentification.
- `project/app/Views/` : vues du front-office, du back-office et des erreurs.
- `project/config/` : connexion à MySQL.
- `project/database/init/` : scripts exécutés automatiquement par MySQL au démarrage.
- `project/docker/` : image PHP/Apache et configuration du virtual host.
- `project/guide/` : documentation de réalisation et guides techniques.
- `project/storage/` : fichiers générés ou stockés pendant l'exécution.

## Fonctionnement de l'application

Toutes les requêtes passent par `project/public/index.php`, qui démarre la session PHP, charge les contrôleurs, vérifie le schéma de la base, analyse la route demandée, vérifie l'authentification, récupère ou modifie les données et affiche la vue correspondante.

`project/app/Controllers/ArticleController.php` gère les articles avec notamment `getPublishedArticles()`, `getPublishedArticleBySlug()`, `getAllArticlesAdmin()`, `saveArticle()`, `deleteArticle()`, `slugify()`, `generateUniqueSlug()` et `handleImageUpload()`.

Un article possède notamment les champs suivants :

```text
id, titre, slug, resume, contenu,
meta_title, meta_description,
image_url, image_alt, status,
created_at, updated_at
```

Seuls les articles avec `status = 'published'` sont visibles publiquement.

`project/app/Controllers/AuthController.php` crée la table `users` si nécessaire, crée un administrateur par défaut, vérifie les mots de passe avec `password_verify()` et utilise une session PHP pour conserver l'authentification.

Identifiants de développement par défaut :

```text
Utilisateur : admin
Mot de passe : admin123
```

Ces identifiants doivent être changés avant toute mise en production.

## Installation avec Docker

### Prérequis

- Docker
- Docker Compose

### Démarrer le projet

Le fichier `docker-compose.yml` se trouve dans `project/`. Depuis la racine du dépôt :

```bash
cd project
docker compose up --build -d
```

### Accéder au site

- Site public : http://localhost:8080
- Liste des articles : http://localhost:8080/capsule
- Connexion : http://localhost:8080/acces-bo
- Back-office : http://localhost:8080/atelier

### Vérifier les services

```bash
docker compose ps
```

### Consulter les logs

```bash
docker compose logs -f web
docker compose logs -f mysql
```

### Arrêter les services

```bash
docker compose down
```

Pour supprimer également les données MySQL :

```bash
docker compose down -v
```

> La commande `docker compose down -v` supprime le volume `mysql_data` et donc les données locales de la base.

## Connexion à MySQL

Depuis le conteneur :

```bash
docker exec -it blog_mysql mysql -ubloguser -pblogpass blog
```

Depuis la machine hôte :

```bash
mysql -h 127.0.0.1 -P 3307 -ubloguser -pblogpass blog
```

Paramètres locaux définis dans `docker-compose.yml` :

```text
DB_HOST=mysql
DB_PORT=3306
DB_USER=bloguser
DB_PASS=blogpass
DB_NAME=blog
APP_ADMIN_USER=admin
APP_ADMIN_PASS=admin123
```

## Base de données

La base `blog` contient principalement deux tables :

- `articles` : contenus, slugs, métadonnées, images et statuts ;
- `users` : comptes du back-office et mots de passe hashés.

Le script d'initialisation se trouve dans `project/database/init/001_create_articles.sql`.

## Sécurité et recommandations

Avant un déploiement en production :

- remplacer tous les identifiants présents dans Docker ;
- ne pas afficher les identifiants par défaut dans l'interface ;
- ajouter une protection CSRF ;
- contrôler et nettoyer le HTML fourni par TinyMCE ;
- activer HTTPS ;
- limiter les tentatives de connexion ;
- séparer la configuration de développement et celle de production ;
- vérifier la présence de l'extension GD dans l'image PHP ;
- ajouter des tests automatisés.

## Architecture simplifiée

```text
Navigateur
    │
    ▼
Apache + mod_rewrite
    │
    ▼
project/public/index.php
    │
    ├── ArticleController.php
    ├── AuthController.php
    ├── Views front-office
    └── Views back-office
    │
    ▼
MySQL
    ├── articles
    └── users
```

Le projet suit une organisation proche du modèle MVC : point d'entrée public, contrôleurs métier, vues PHP, configuration séparée et scripts SQL d'initialisation.
