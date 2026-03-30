<?php

declare(strict_types=1);

function getDbConnection(): mysqli
{
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = (int) (getenv('DB_PORT') ?: 3307);
    $user = getenv('DB_USER') ?: 'bloguser';
    $pass = getenv('DB_PASS') ?: 'blogpass';
    $db   = getenv('DB_NAME') ?: 'blog';

    $conn = new mysqli($host, $user, $pass, $db, $port);

    if ($conn->connect_error) {
        throw new RuntimeException('Erreur connexion : ' . $conn->connect_error);
    }

    $conn->set_charset('utf8mb4');

    return $conn;
}
