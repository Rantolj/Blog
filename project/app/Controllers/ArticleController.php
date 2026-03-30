<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

function ensureArticlesSchema(): void
{
    $conn = getDbConnection();

    $createTableSql = "
        CREATE TABLE IF NOT EXISTS articles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titre VARCHAR(255) NOT NULL,
            slug VARCHAR(255) DEFAULT NULL,
            resume TEXT DEFAULT NULL,
            contenu LONGTEXT NOT NULL,
            meta_title VARCHAR(255) DEFAULT NULL,
            meta_description VARCHAR(160) DEFAULT NULL,
            image_url VARCHAR(255) DEFAULT NULL,
            image_alt VARCHAR(255) DEFAULT NULL,
            status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_slug (slug)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";

    if ($conn->query($createTableSql) === false) {
        throw new RuntimeException('Erreur creation table : ' . $conn->error);
    }

    $requiredColumns = [
        'slug' => "ALTER TABLE articles ADD COLUMN slug VARCHAR(255) DEFAULT NULL AFTER titre",
        'resume' => "ALTER TABLE articles ADD COLUMN resume TEXT DEFAULT NULL AFTER slug",
        'meta_title' => "ALTER TABLE articles ADD COLUMN meta_title VARCHAR(255) DEFAULT NULL AFTER contenu",
        'meta_description' => "ALTER TABLE articles ADD COLUMN meta_description VARCHAR(160) DEFAULT NULL AFTER meta_title",
        'image_url' => "ALTER TABLE articles ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER meta_description",
        'image_alt' => "ALTER TABLE articles ADD COLUMN image_alt VARCHAR(255) DEFAULT NULL AFTER image_url",
        'status' => "ALTER TABLE articles ADD COLUMN status ENUM('draft', 'published') NOT NULL DEFAULT 'published' AFTER image_alt",
        'updated_at' => "ALTER TABLE articles ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    ];

    foreach ($requiredColumns as $column => $alterSql) {
        if (!columnExists($conn, 'articles', $column)) {
            if ($conn->query($alterSql) === false) {
                throw new RuntimeException('Erreur schema (' . $column . ') : ' . $conn->error);
            }
        }
    }

    $indexExists = indexExists($conn, 'articles', 'uniq_slug');
    if (!$indexExists) {
        $conn->query("ALTER TABLE articles ADD UNIQUE KEY uniq_slug (slug)");
    }

    $conn->query("UPDATE articles SET slug = NULL WHERE slug = ''");

    $rows = $conn->query("SELECT id, titre FROM articles WHERE slug IS NULL");
    if ($rows instanceof mysqli_result) {
        while ($row = $rows->fetch_assoc()) {
            $slug = generateUniqueSlug($conn, slugify((string) $row['titre']), (int) $row['id']);
            $stmt = $conn->prepare('UPDATE articles SET slug = ? WHERE id = ?');
            if ($stmt !== false) {
                $id = (int) $row['id'];
                $stmt->bind_param('si', $slug, $id);
                $stmt->execute();
                $stmt->close();
            }
        }
        $rows->close();
    }

    $conn->close();
}

function getPublishedArticles(): array
{
    $conn = getDbConnection();
    $sql = "SELECT id, titre, slug, resume, contenu, meta_title, meta_description, image_url, image_alt, created_at
            FROM articles
            WHERE status = 'published'
            ORDER BY created_at DESC";
    $result = $conn->query($sql);
    if ($result === false) {
        throw new RuntimeException('Erreur lecture : ' . $conn->error);
    }

    $articles = $result->fetch_all(MYSQLI_ASSOC);
    $result->close();
    $conn->close();

    return $articles;
}

function getPublishedArticleBySlug(string $slug): ?array
{
    $conn = getDbConnection();
    $sql = "SELECT id, titre, slug, resume, contenu, meta_title, meta_description, image_url, image_alt, created_at
            FROM articles
            WHERE slug = ? AND status = 'published'
            LIMIT 1";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new RuntimeException('Erreur preparation : ' . $conn->error);
    }

    $stmt->bind_param('s', $slug);
    $stmt->execute();
    $result = $stmt->get_result();
    $article = $result ? $result->fetch_assoc() : null;

    if ($result instanceof mysqli_result) {
        $result->close();
    }
    $stmt->close();
    $conn->close();

    return $article ?: null;
}

function getAllArticlesAdmin(): array
{
    $conn = getDbConnection();
    $result = $conn->query('SELECT * FROM articles ORDER BY created_at DESC');
    if ($result === false) {
        throw new RuntimeException('Erreur lecture admin : ' . $conn->error);
    }

    $articles = $result->fetch_all(MYSQLI_ASSOC);
    $result->close();
    $conn->close();

    return $articles;
}

function getArticleById(int $id): ?array
{
    $conn = getDbConnection();
    $stmt = $conn->prepare('SELECT * FROM articles WHERE id = ? LIMIT 1');
    if ($stmt === false) {
        throw new RuntimeException('Erreur preparation : ' . $conn->error);
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $article = $result ? $result->fetch_assoc() : null;

    if ($result instanceof mysqli_result) {
        $result->close();
    }
    $stmt->close();
    $conn->close();

    return $article ?: null;
}

function saveArticle(array $data, ?int $id = null): int
{
    $conn = getDbConnection();

    $title = trim((string) ($data['titre'] ?? ''));
    $content = (string) ($data['contenu'] ?? '');

    if ($title === '' || $content === '') {
        throw new InvalidArgumentException('Titre et contenu sont obligatoires.');
    }

    $slugInput = trim((string) ($data['slug'] ?? ''));
    $baseSlug = $slugInput !== '' ? slugify($slugInput) : slugify($title);
    $slug = generateUniqueSlug($conn, $baseSlug, $id);

    $resume = trim((string) ($data['resume'] ?? ''));
    if ($resume === '') {
        $resume = mb_substr(strip_tags($content), 0, 220);
    }

    $metaTitle = trim((string) ($data['meta_title'] ?? ''));
    if ($metaTitle === '') {
        $metaTitle = $title;
    }

    $metaDescription = trim((string) ($data['meta_description'] ?? ''));
    if ($metaDescription === '') {
        $metaDescription = mb_substr(strip_tags($resume), 0, 155);
    }

    $imageUrl = trim((string) ($data['image_url'] ?? ''));
    $imageAlt = trim((string) ($data['image_alt'] ?? ''));
    if ($imageAlt === '') {
        $imageAlt = $title;
    }

    $statusInput = (string) ($data['status'] ?? 'draft');
    $status = in_array($statusInput, ['draft', 'published'], true) ? $statusInput : 'draft';

    if ($id === null) {
        $sql = 'INSERT INTO articles (titre, slug, resume, contenu, meta_title, meta_description, image_url, image_alt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            throw new RuntimeException('Erreur preparation : ' . $conn->error);
        }

        $stmt->bind_param('sssssssss', $title, $slug, $resume, $content, $metaTitle, $metaDescription, $imageUrl, $imageAlt, $status);
        if (!$stmt->execute()) {
            $stmt->close();
            $conn->close();
            throw new RuntimeException('Erreur insertion : ' . $conn->error);
        }

        $newId = (int) $conn->insert_id;
        $stmt->close();
        $conn->close();

        return $newId;
    }

    $sql = 'UPDATE articles SET titre = ?, slug = ?, resume = ?, contenu = ?, meta_title = ?, meta_description = ?, image_url = ?, image_alt = ?, status = ? WHERE id = ?';
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new RuntimeException('Erreur preparation : ' . $conn->error);
    }

    $stmt->bind_param('sssssssssi', $title, $slug, $resume, $content, $metaTitle, $metaDescription, $imageUrl, $imageAlt, $status, $id);
    if (!$stmt->execute()) {
        $stmt->close();
        $conn->close();
        throw new RuntimeException('Erreur mise a jour : ' . $conn->error);
    }

    $stmt->close();
    $conn->close();

    return $id;
}

function deleteArticle(int $id): void
{
    $conn = getDbConnection();
    $stmt = $conn->prepare('DELETE FROM articles WHERE id = ?');
    if ($stmt === false) {
        throw new RuntimeException('Erreur preparation suppression : ' . $conn->error);
    }

    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        $stmt->close();
        $conn->close();
        throw new RuntimeException('Erreur suppression : ' . $conn->error);
    }

    $stmt->close();
    $conn->close();
}

function slugify(string $value): string
{
    $slug = mb_strtolower(trim($value));
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $slug) ?: $slug;
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    $slug = trim($slug, '-');

    return $slug !== '' ? $slug : 'article';
}

function generateUniqueSlug(mysqli $conn, string $baseSlug, ?int $excludeId = null): string
{
    $slug = $baseSlug;
    $counter = 1;

    while (slugExists($conn, $slug, $excludeId)) {
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }

    return $slug;
}

function slugExists(mysqli $conn, string $slug, ?int $excludeId = null): bool
{
    if ($excludeId === null) {
        $stmt = $conn->prepare('SELECT id FROM articles WHERE slug = ? LIMIT 1');
        if ($stmt === false) {
            throw new RuntimeException('Erreur preparation slug : ' . $conn->error);
        }
        $stmt->bind_param('s', $slug);
    } else {
        $stmt = $conn->prepare('SELECT id FROM articles WHERE slug = ? AND id != ? LIMIT 1');
        if ($stmt === false) {
            throw new RuntimeException('Erreur preparation slug : ' . $conn->error);
        }
        $stmt->bind_param('si', $slug, $excludeId);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result instanceof mysqli_result && $result->num_rows > 0;

    if ($result instanceof mysqli_result) {
        $result->close();
    }
    $stmt->close();

    return $exists;
}

function columnExists(mysqli $conn, string $tableName, string $columnName): bool
{
    $stmt = $conn->prepare('SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1');
    if ($stmt === false) {
        throw new RuntimeException('Erreur verification colonne : ' . $conn->error);
    }

    $stmt->bind_param('ss', $tableName, $columnName);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result instanceof mysqli_result && $result->num_rows > 0;

    if ($result instanceof mysqli_result) {
        $result->close();
    }
    $stmt->close();

    return $exists;
}

function indexExists(mysqli $conn, string $tableName, string $indexName): bool
{
    $stmt = $conn->prepare('SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1');
    if ($stmt === false) {
        throw new RuntimeException('Erreur verification index : ' . $conn->error);
    }

    $stmt->bind_param('ss', $tableName, $indexName);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result instanceof mysqli_result && $result->num_rows > 0;

    if ($result instanceof mysqli_result) {
        $result->close();
    }

    $stmt->close();

    return $exists;
}
