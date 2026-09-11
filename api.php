<?php
// API REST sencilla para la tabla "estudiantes" (una sola tabla).
// Acciones vía ?accion=... : listar | crear | actualizar | eliminar | eliminar_todos

session_start();
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if (empty($_SESSION['autenticado'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Debes iniciar sesión']);
    exit;
}

function responder($datos, int $codigoHttp = 200): void {
    http_response_code($codigoHttp);
    echo json_encode($datos);
    exit;
}

function leerCuerpoJson(): array {
    $crudo = file_get_contents('php://input');
    $datos = json_decode($crudo, true);
    return is_array($datos) ? $datos : [];
}

function validarEstudiante(array $datos, array &$errores): array {
    $nombre = trim($datos['nombre'] ?? '');
    $edad = filter_var($datos['edad'] ?? null, FILTER_VALIDATE_INT);
    $sexo = trim($datos['sexo'] ?? '');
    $carrera = trim($datos['carrera'] ?? '');
    $telefono = trim($datos['telefono'] ?? '');
    $correo = trim($datos['correo'] ?? '');
    $foto = isset($datos['foto']) ? (string) $datos['foto'] : null;

    if ($nombre === '') $errores[] = 'El nombre no puede estar vacío';
    if ($edad === false || $edad < 1 || $edad > 120) $errores[] = 'Ingrese una edad válida (1 a 120)';
    if (!in_array($sexo, ['Masculino', 'Femenino'], true)) $errores[] = 'Sexo inválido';
    if ($carrera === '') $errores[] = 'La carrera no puede estar vacía';
    if (strlen($telefono) < 8) $errores[] = 'Ingrese un teléfono de al menos 8 dígitos';
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) $errores[] = 'Ingrese un correo electrónico válido';

    return [
        'nombre' => $nombre,
        'edad' => $edad,
        'sexo' => $sexo,
        'carrera' => $carrera,
        'telefono' => $telefono,
        'correo' => $correo,
        'foto' => $foto,
    ];
}

$accion = $_GET['accion'] ?? '';

try {
    $pdo = obtenerConexion();

    switch ($accion) {
        case 'listar': {
            $filas = $pdo->query('SELECT id, nombre, edad, sexo, carrera, telefono, correo, foto FROM estudiantes ORDER BY nombre ASC')->fetchAll();
            responder($filas);
        }

        case 'crear': {
            $errores = [];
            $datos = validarEstudiante(leerCuerpoJson(), $errores);
            if ($errores) responder(['error' => implode('. ', $errores)], 422);

            $sql = 'INSERT INTO estudiantes (nombre, edad, sexo, carrera, telefono, correo, foto) VALUES (:nombre, :edad, :sexo, :carrera, :telefono, :correo, :foto)';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($datos);
            $id = (int) $pdo->lastInsertId();

            $fila = $pdo->prepare('SELECT id, nombre, edad, sexo, carrera, telefono, correo, foto FROM estudiantes WHERE id = ?');
            $fila->execute([$id]);
            responder($fila->fetch(), 201);
        }

        case 'actualizar': {
            $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
            if (!$id) responder(['error' => 'Id inválido'], 400);

            $errores = [];
            $datos = validarEstudiante(leerCuerpoJson(), $errores);
            if ($errores) responder(['error' => implode('. ', $errores)], 422);
            $datos['id'] = $id;

            $sql = 'UPDATE estudiantes SET nombre = :nombre, edad = :edad, sexo = :sexo, carrera = :carrera, telefono = :telefono, correo = :correo, foto = :foto WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($datos);

            $fila = $pdo->prepare('SELECT id, nombre, edad, sexo, carrera, telefono, correo, foto FROM estudiantes WHERE id = ?');
            $fila->execute([$id]);
            $resultado = $fila->fetch();
            if (!$resultado) responder(['error' => 'Estudiante no encontrado'], 404);
            responder($resultado);
        }

        case 'eliminar': {
            $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
            if (!$id) responder(['error' => 'Id inválido'], 400);

            $stmt = $pdo->prepare('DELETE FROM estudiantes WHERE id = ?');
            $stmt->execute([$id]);
            responder(['ok' => true, 'eliminadas' => $stmt->rowCount()]);
        }

        case 'eliminar_todos': {
            $pdo->exec('DELETE FROM estudiantes');
            responder(['ok' => true]);
        }

        default:
            responder(['error' => 'Acción no reconocida'], 400);
    }
} catch (PDOException $e) {
    responder(['error' => 'Error de base de datos: ' . $e->getMessage()], 500);
}
