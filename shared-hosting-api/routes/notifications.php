<?php
// Route: POST /notifications/token — Save FCM token for logged-in user
//        POST /notifications/test  — Send a test notification

require_once __DIR__ . '/../fcm_helper.php';

$uid = auth_user();
$db  = get_db();
$b   = body();

// POST /notifications/token — Save/Update FCM device token
if ($method === 'POST' && $p1 === 'token') {
    if (empty($b['token'])) err('FCM token required');

    // Upsert token for this user
    $stmt = $db->prepare('SELECT id FROM fcm_tokens WHERE user_id = ?');
    $stmt->execute([$uid]);
    $existing = $stmt->fetch();

    if ($existing) {
        $db->prepare('UPDATE fcm_tokens SET token = ?, updated_at = NOW() WHERE user_id = ?')
           ->execute([$b['token'], $uid]);
    } else {
        $db->prepare('INSERT INTO fcm_tokens (user_id, token) VALUES (?, ?)')
           ->execute([$uid, $b['token']]);
    }
    ok([], 'FCM token saved!');
}

// POST /notifications/test — Send a test notification to self
if ($method === 'POST' && $p1 === 'test') {
    $stmt = $db->prepare('SELECT token FROM fcm_tokens WHERE user_id = ?');
    $stmt->execute([$uid]);
    $row = $stmt->fetch();
    if (!$row) err('No FCM token found. Open app on your device first.', 404);

    $sent = fcm_send(
        $row['token'],
        '🔔 Test Notification',
        'Yarana LifeOS notifications sahi se kaam kar rahi hain!',
        ['type' => 'test']
    );

    if ($sent) ok([], 'Test notification sent!');
    else err('Notification send failed', 500);
}

err('Method not allowed', 405);
