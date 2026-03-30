<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';

function ensureUsersSchema(): void
{
    $conn = getDbConnection();

    $createTableSql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";

    if ($conn->query($createTableSql) === false) {
        throw new RuntimeException('Erreur creation table users : ' . $conn->error);
    }

    $defaultUsername = getenv('APP_ADMIN_USER') ?: 'admin';
    $defaultPassword = getenv('APP_ADMIN_PASS') ?: 'admin123';

    $stmt = $conn->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    if ($stmt === false) {
        throw new RuntimeException('Erreur verification user : ' . $conn->error);
    }

    $stmt->bind_param('s', $defaultUsername);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result instanceof mysqli_result && $result->num_rows > 0;

    if ($result instanceof mysqli_result) {
        $result->close();
    }
    $stmt->close();

    if (!$exists) {
        $hash = password_hash($defaultPassword, PASSWORD_DEFAULT);
        if ($hash === false) {
            $conn->close();
            throw new RuntimeException('Erreur hash mot de passe.');
        }

        $insert = $conn->prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        if ($insert === false) {
            $conn->close();
            throw new RuntimeException('Erreur insertion user : ' . $conn->error);
        }

        $insert->bind_param('ss', $defaultUsername, $hash);
        if (!$insert->execute()) {
            $insert->close();
            $conn->close();
            throw new RuntimeException('Erreur insertion user : ' . $conn->error);
        }

        $insert->close();
    }

    $conn->close();
}

function authenticateBackofficeUser(string $username, string $password): ?array
{
    $conn = getDbConnection();

    $stmt = $conn->prepare('SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1');
    if ($stmt === false) {
        throw new RuntimeException('Erreur preparation auth : ' . $conn->error);
    }

    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result ? $result->fetch_assoc() : null;

    if ($result instanceof mysqli_result) {
        $result->close();
    }
    $stmt->close();
    $conn->close();

    if ($user === null) {
        return null;
    }

    $hash = (string) ($user['password_hash'] ?? '');
    if ($hash === '' || !password_verify($password, $hash)) {
        return null;
    }

    return [
        'id' => (int) $user['id'],
        'username' => (string) $user['username'],
    ];
}
