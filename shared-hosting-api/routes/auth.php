<?php
// Routes: POST /auth/register | POST /auth/login | GET /auth/profile | PUT /auth/fcm-token
$action = $p1; // register | login | profile | fcm-token

if ($method === 'POST' && $action === 'register') {
    $b = body();
    $name = trim($b['name'] ?? ''); $mobile = trim($b['mobile'] ?? ''); $pass = $b['password'] ?? '';
    if (!$name || !$mobile || !$pass) err('Name, mobile and password required');
    if (strlen($pass) < 6) err('Password must be at least 6 characters');
    $db = get_db();
    if ($db->prepare('SELECT id FROM users WHERE mobile=?')->execute([$mobile]) && $db->query("SELECT id FROM users WHERE mobile='$mobile'")->fetch()) err('Mobile already registered');
    $stmt = $db->prepare('SELECT id FROM users WHERE mobile=?'); $stmt->execute([$mobile]);
    if ($stmt->fetch()) err('Mobile already registered');
    $db->prepare('INSERT INTO users (name,mobile,password) VALUES (?,?,?)')->execute([$name,$mobile,password_hash($pass,PASSWORD_BCRYPT)]);
    $uid = $db->lastInsertId();
    $user = $db->query("SELECT id,name,mobile,created_at FROM users WHERE id=$uid")->fetch();
    ok(['token' => jwt_make(['user_id'=>(int)$uid]), 'user' => $user], 'Account created');
}

if ($method === 'POST' && $action === 'login') {
    $b = body(); $mobile = trim($b['mobile'] ?? ''); $pass = $b['password'] ?? '';
    if (!$mobile || !$pass) err('Mobile and password required');
    $stmt = $db = get_db(); $stmt = $db->prepare('SELECT * FROM users WHERE mobile=?'); $stmt->execute([$mobile]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($pass, $user['password'])) err('Invalid credentials', 401);
    unset($user['password']);
    ok(['token' => jwt_make(['user_id'=>(int)$user['id']]), 'user' => $user], 'Login successful');
}

if ($method === 'GET' && $action === 'profile') {
    $uid = auth_user();
    $user = get_db()->query("SELECT id,name,mobile,created_at FROM users WHERE id=$uid")->fetch();
    ok(['user' => $user]);
}

if ($method === 'PUT' && $action === 'fcm-token') {
    $uid = auth_user(); $b = body();
    get_db()->prepare('UPDATE users SET fcm_token=? WHERE id=?')->execute([$b['fcm_token']??null, $uid]);
    ok([], 'FCM token updated');
}

err('Not found', 404);
