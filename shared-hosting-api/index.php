<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

// CORS Headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Parse URL — auto-detect base folder from script path
$uri        = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptDir  = dirname($_SERVER['SCRIPT_NAME']); // e.g. /yarana-api
$path       = trim(str_replace($scriptDir, '', $uri), '/');
$parts      = array_values(array_filter(explode('/', $path)));
$res        = $parts[0] ?? '';
$p1         = $parts[1] ?? '';
$p2         = $parts[2] ?? '';
$method     = $_SERVER['REQUEST_METHOD'];

// Root — welcome message
if ($res === '') {
    ok(['name' => 'Yarana LifeOS API', 'version' => '1.0.0', 'status' => 'running'], 'Welcome to Yarana LifeOS API! 🚀');
}

// Health check
if ($res === 'health') {
    ok(['version' => '1.0.0', 'time' => date('c'), 'db' => 'connected'], 'API is healthy!');
}

switch ($res) {
    case 'auth':          require __DIR__ . '/routes/auth.php';          break;
    case 'tasks':         require __DIR__ . '/routes/tasks.php';         break;
    case 'clients':       require __DIR__ . '/routes/clients.php';       break;
    case 'ledger':        require __DIR__ . '/routes/ledger.php';        break;
    case 'notes':         require __DIR__ . '/routes/notes.php';         break;
    case 'dashboard':     require __DIR__ . '/routes/dashboard.php';     break;
    case 'notifications': require __DIR__ . '/routes/notifications.php'; break;
    default: err('Route not found', 404);
}
