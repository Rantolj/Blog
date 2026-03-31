CREATE DATABASE IF NOT EXISTS blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog;

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des utilisateurs (avec email et rôles)
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'author') NOT NULL DEFAULT 'author',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des articles (avec clés étrangères et soft delete)
CREATE TABLE IF NOT EXISTS articles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    author_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NULL, -- NULL si pas de catégorie
    titre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    resume TEXT DEFAULT NULL,
    contenu LONGTEXT NOT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description VARCHAR(160) DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    image_alt VARCHAR(255) DEFAULT NULL,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete
    
    -- Contraintes de clés étrangères
    CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Index pour optimiser les recherches
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- --------------------------------------------------------
-- DONNÉES DE TEST (FIXTURES)
-- --------------------------------------------------------

-- 1. Insertion de l'administrateur
INSERT IGNORE INTO users (id, username, email, password_hash, role)
VALUES (1, 'admin', 'admin@blog.local', '$2y$10$PkQ0a6L91nqQ0JFTj7kMyumoWJQXli00NYy.cmZ.xrceKKSinyu8C', 'admin');

-- 2. Insertion de quelques catégories
INSERT IGNORE INTO categories (id, name, slug) VALUES 
(1, 'Développement', 'developpement'),
(2, 'Astuces & Tutoriels', 'astuces-et-tutoriels');

-- 3. Insertion d'articles de test avec une image par défaut
-- L'image pointe vers un fichier qui serait placé manuellement dans "public/assets/images/default-article.jpg"
INSERT IGNORE INTO articles (author_id, category_id, titre, slug, resume, contenu, meta_title, meta_description, image_url, image_alt, status) VALUES 
(1, 1, 'Architecture MVC en PHP', 'architecture-mvc-en-php', 'Découvrez comment structurer correctement votre projet PHP de manière professionnelle.', '<p>Le modèle MVC sépare votre application en trois composants logiques : le Modèle, la Vue et le Contrôleur.</p><p>Cela garantit un code plus maintenable.</p>', 'Guide de l''architecture MVC PHP', 'Tutoriel complet pour bien démarrer une architecture MVC avec PHP 8.', 'assets/images/default-article.jpg', 'Illustration architecture MVC', 'published'),
(1, 2, 'Mise en place de Docker', 'mise-en-place-de-docker', 'Un environnement de développement sain passe par Docker.', '<p>Découvrez comment containeriser votre base de données MySQL et votre serveur Apache/PHP en seulement quelques fichiers.</p>', 'Tutoriel Docker pour PHP', 'Apprendre à configurer un docker-compose.yml pour PHP et MySQL.', 'assets/images/default-article.jpg', 'Logo Docker', 'published');
