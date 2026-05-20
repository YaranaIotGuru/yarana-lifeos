<?php
function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=".DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function send($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function ok($data = [], $msg = 'Success') {
    send(array_merge(['success' => true, 'message' => $msg], $data));
}

function err($msg, $code = 400) {
    send(['success' => false, 'message' => $msg], $code);
}

function body() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function jwt_make($payload) {
    $h = rtrim(base64_encode(json_encode(['alg'=>'HS256','typ'=>'JWT'])), '=');
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $p = rtrim(base64_encode(json_encode($payload)), '=');
    $s = rtrim(base64_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true)), '=');
    return "$h.$p.$s";
}

function jwt_read($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $s] = $parts;
    $expected = rtrim(base64_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true)), '=');
    if (!hash_equals($expected, $s)) return null;
    $data = json_decode(base64_decode($p), true);
    if (!$data || $data['exp'] < time()) return null;
    return $data;
}

function auth_user() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/i', trim($auth), $m)) err('Unauthorized', 401);
    $data = jwt_read($m[1]);
    if (!$data) err('Invalid or expired token', 401);
    return (int)$data['user_id'];
}
