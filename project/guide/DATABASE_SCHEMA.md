# Modélisation de la Base de Données - Blog Iran Conflict Monitor

## 1. Vue d'ensemble

La base de données contient 3 tables principales :
- **categories** : Catégories d'articles
- **users** : Utilisateurs avec rôles et authentification
- **articles** : Articles avec relations aux utilisateurs et catégories

---

## 2. Schémas des Tables

### 2.1 Table : `categories`

**Description** : Stocke les catégories d'articles du blog.

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| name | VARCHAR(100) | NOT NULL | Nom de la catégorie (ex: "Développement") |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | Slug URL-friendly (ex: "developpement") |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

**Exemple de données** :
```
id=1, name="Développement", slug="developpement"
id=2, name="Astuces & Tutoriels", slug="astuces-et-tutoriels"
```

---

### 2.2 Table : `users`

**Description** : Gère les utilisateurs avec rôles et authentification pour le BackOffice.

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Nom d'utilisateur pour login |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Adresse email unique |
| password_hash | VARCHAR(255) | NOT NULL | Hash bcrypt du mot de passe |
| role | ENUM('admin', 'editor', 'author') | NOT NULL, DEFAULT='author' | Rôle utilisateur |
| active | TINYINT(1) | NOT NULL, DEFAULT=1 | Statut du compte (1=actif, 0=désactivé) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

**Exemple de données** :
```
id=1, username="admin", email="admin@blog.local", password_hash="$2y$10$...", role="admin", active=1
```

---

### 2.3 Table : `articles`

**Description** : Articles du blog avec contenu, métadonnées SEO et relations.

| Colonne | Type | Constraints | Description |
|---------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| author_id | INT UNSIGNED | NOT NULL, FK→users(id) | Référence à l'auteur (user) |
| category_id | INT UNSIGNED | NULL, FK→categories(id) | Référence à la catégorie (nullable) |
| titre | VARCHAR(255) | NOT NULL | Titre de l'article |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | Slug URL-friendly (ex: "mon-article") |
| resume | TEXT | NULL, DEFAULT=NULL | Résumé/extrait court de l'article |
| contenu | LONGTEXT | NOT NULL | Contenu complet (HTML depuis TinyMCE) |
| meta_title | VARCHAR(255) | NULL, DEFAULT=NULL | Titre pour le SEO (tag `<title>`) |
| meta_description | VARCHAR(160) | NULL, DEFAULT=NULL | Description pour le SEO (meta description) |
| image_url | VARCHAR(255) | NULL, DEFAULT=NULL | URL de l'image de couverture |
| image_alt | VARCHAR(255) | NULL, DEFAULT=NULL | Texte alternatif pour l'image (accessibilité) |
| status | ENUM('draft', 'published', 'archived') | NOT NULL, DEFAULT='draft' | Statut de publication |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |
| deleted_at | TIMESTAMP | NULL, DEFAULT=NULL | Soft delete : date de suppression logique |

**Indexes** :
- `idx_status (status)` : Optimise les recherches par statut (pour afficher les articles publiés)
- `idx_created_at (created_at)` : Optimise le tri par date

**Contraintes de clés étrangères** :
- `fk_articles_author` : `author_id → users(id)` avec `ON DELETE RESTRICT`
- `fk_articles_category` : `category_id → categories(id)` avec `ON DELETE SET NULL`

---

## 3. Diagramme de Relations

```
┌─────────────────┐
│    users        │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ role            │
│ active          │
│ created_at      │
│ updated_at      │
└─────────────────┘
        ▲
        │ (1)
        │ author_id (FK)
        │
┌───────────────────────────────────┐        ┌─────────────────┐
│         articles                  │        │   categories    │
├───────────────────────────────────┤        ├─────────────────┤
│ id (PK)                           │        │ id (PK)         │
│ author_id (FK) → users(id)        │        │ name            │
│ category_id (FK) → categories(id) ├────────│ slug            │
│ titre                             │   (N)  │ created_at      │
│ slug                              │        │ updated_at      │
│ resume                            │        └─────────────────┘
│ contenu                           │
│ meta_title                        │
│ meta_description                  │
│ image_url                         │
│ image_alt                         │
│ status                            │
│ created_at                        │
│ updated_at                        │
│ deleted_at (Soft Delete)          │
└───────────────────────────────────┘
```

**Cardinalités** :
- 1 user → N articles (un auteur peut écrire plusieurs articles)
- 1 category → N articles (une catégorie peut contenir plusieurs articles)
- 1 article → 1 user, 0..1 category

---

## 4. Flux Logique d'Utilisation

### Scénario FrontOffice (Public)
1. Visiteur accède à `/capsule` (liste articles)
2. Système récupère tous les articles avec `status='published'`
3. Articles joinés avec `users` (pour l'auteur) et `categories` (pour la catégorie)
4. Affichage des articles avec titre, résumé, image, etc.

### Scénario BackOffice (Admin)
1. Admin se connecte avec identifiants (username/password) → vérification dans `users`
2. Sesssion créée : `$_SESSION['is_admin']=true`, `$_SESSION['admin_id']=1`
3. Admin accède à `/atelier` (gestion contenus)
4. Admin crée/modifie/supprime/archive des articles
5. Les modifications mettent à jour `articles.updated_at`
6. Les suppressions utilisent le soft delete : `articles.deleted_at` est rempli

### Filtrage FrontOffice
- Seuls les articles avec `status='published'` sont visibles
- Soft-deleted articles (deleted_at IS NOT NULL) sont ignorés
- Les articles draft/archived ne s'affichent qu'en BackOffice

---

## 5. Optimisations et Considérations

### Indexes
```sql
-- Optimization pour les recherches
INDEX idx_status (status)        -- Filtre articles publiés rapidement
INDEX idx_created_at (created_at) -- Tri par date performant
-- Implicites : PRIMARY KEY (id), UNIQUE (slug), UNIQUE (username)
```

### Soft Delete (deleted_at)
- Articles supprimés ne sont pas effacés physiquement
- Permet la récupération ultérieure si nécessaire
- Les requêtes FO doivent toujours vérifier `deleted_at IS NULL`

### Charset UTF-8
- Toute la base utilise `utf8mb4_unicode_ci` pour supporter complètement Unicode
- Importante pour les français accents, caractères spéciaux

### Contraintes de clés étrangères
- `ON DELETE RESTRICT` pour users : un article ne peut pas orpheliner son auteur
- `ON DELETE SET NULL` pour categories : supprimer une catégorie met juste article.category_id à NULL

---

## 6. Données de Test Initiales

Lors du premier déploiement, les fixtures SQL peuplent :

```sql
-- Admin user
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@blog.local', '$2y$10$PkQ0a6L91nqQ0JFTj7kMyumoWJQXli00NYy.cmZ.xrceKKSinyu8C', 'admin');

-- Categories
INSERT INTO categories (name, slug)
VALUES 
('Développement', 'developpement'),
('Astuces & Tutoriels', 'astuces-et-tutoriels');

-- Sample articles (published)
INSERT INTO articles (author_id, category_id, titre, slug, resume, contenu, status)
VALUES 
(1, 1, 'Architecture MVC en PHP', 'architecture-mvc-en-php', '...', '<p>...</p>', 'published'),
(1, 2, 'Mise en place de Docker', 'mise-en-place-de-docker', '...', '<p>...</p>', 'published');
```

---

## 7. Évolutions Futures Possibles

Si le projet s'agrandit, considérer :
- Table `comments` pour les commentaires d'articles
- Table `tags` pour un système de tags en plus des catégories
- Table `media` pour centraliser les images uploadées
- Table `audit_logs` pour tracer les actions admin
- Système de permissions granulaires au lieu d'un simple enum `role`
