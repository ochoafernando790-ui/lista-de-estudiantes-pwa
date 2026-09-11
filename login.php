<?php
// Autenticación simple por contraseña compartida ("admin123").
// Acciones vía ?accion=... : estado | entrar | salir

session_start();
header('Content-Type: application/json; charset=utf-8');

// Hash de "admin123" (nunca se guarda la contraseña en texto plano).
define('HASH_ADMIN', '$2y$10$apo1X84vjmm68uAJbGe88.W1ZGvT00inFcBtIQpZop1zEL6OCMN9S');

$accion = $_GET['accion'] ?? '';

if ($accion === 'estado') {
    echo json_encode(['autenticado' => !empty($_SESSION['autenticado'])]);
    exit;
}

if ($accion === 'entrar') {
    $datos = json_decode(file_get_contents('php://input'), true);
    $password = is_array($datos) ? (string) ($datos['password'] ?? '') : '';

    if ($password !== '' && password_verify($password, HASH_ADMIN)) {
        session_regenerate_id(true);
        $_SESSION['autenticado'] = true;
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Contraseña incorrecta']);
    }
    exit;
}

if ($accion === 'salir') {
    $_SESSION = [];
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Acción no reconocida']);
