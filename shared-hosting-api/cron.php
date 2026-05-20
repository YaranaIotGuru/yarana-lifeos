<?php
/**
 * Yarana LifeOS — Reminder Cron Job
 * 
 * Run this every minute via cPanel cron:
 * * * * * curl -s "https://yaranawebtech.in/yarana-api/cron.php?secret=yarana_cron_secret_2024" > /dev/null
 * 
 * OR in cPanel > Cron Jobs, set:
 * Command: curl -s "https://yaranawebtech.in/yarana-api/cron.php?secret=yarana_cron_secret_2024"
 */

// Security: secret key check
define('CRON_SECRET', 'yarana_cron_secret_2024');

if (php_sapi_name() !== 'cli') {
    // Running via web/curl — check secret
    $secret = $_GET['secret'] ?? '';
    if ($secret !== CRON_SECRET) {
        http_response_code(403);
        die(json_encode(['error' => 'Unauthorized']));
    }
}

// Suppress HTML errors
ini_set('display_errors', 0);
error_reporting(0);

// ⚡ Set PHP timezone to IST
date_default_timezone_set('Asia/Kolkata');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/fcm_helper.php';

header('Content-Type: application/json');

try {
    $db = get_db();

    // ⚡ Set MySQL timezone to IST so NOW() matches stored reminder times
    $db->exec("SET time_zone = '+05:30'");

    // Find tasks where reminder_time is within the last 3 minutes AND not yet notified
    $stmt = $db->prepare("
        SELECT t.id, t.title, t.description, t.reminder_time, t.user_id,
               f.token AS fcm_token
        FROM tasks t
        INNER JOIN fcm_tokens f ON f.user_id = t.user_id
        WHERE t.status = 'pending'
          AND t.reminder_time IS NOT NULL
          AND t.notification_sent = 0
          AND t.reminder_time BETWEEN (NOW() - INTERVAL 3 MINUTE) AND (NOW() + INTERVAL 1 MINUTE)
    ");
    $stmt->execute();
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sent = 0; $failed = 0;

    foreach ($tasks as $task) {
        if (empty($task['fcm_token'])) continue;

        $title = '⏰ Task Reminder!';
        $body  = $task['title'];
        if ($task['description']) {
            $body .= ' — ' . mb_substr($task['description'], 0, 80);
        }

        $ok = fcm_send($task['fcm_token'], $title, $body, [
            'task_id' => (string)$task['id'],
            'type'    => 'task_reminder',
        ]);

        if ($ok) {
            // Mark as notified so it doesn't fire again
            $db->prepare('UPDATE tasks SET notification_sent = 1 WHERE id = ?')
               ->execute([$task['id']]);
            $sent++;
        } else {
            $failed++;
        }
    }

    echo json_encode([
        'success'   => true,
        'checked'   => count($tasks),
        'sent'      => $sent,
        'failed'    => $failed,
        'timestamp' => date('c'),
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
