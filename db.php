<?php
// Conexión PDO a la base de datos MySQL "lista_estudiantes".
// Las credenciales viven en config.local.php (no se sube a GitHub).
// Si no existe, copia config.sample.php como config.local.php y edítalo.

$archivoConfig = __DIR__ . '/config.local.php';
if (!file_exists($archivoConfig)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Falta config.local.php. Copia config.sample.php y coloca tus credenciales de MySQL.']);
    exit;
}
require_once $archivoConfig;

function obtenerConexion(): PDO {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $opciones = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, DB_USER, DB_PASS, $opciones);
}
