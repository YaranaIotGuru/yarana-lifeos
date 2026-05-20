<?php
// FCM Helper — Sends push notifications via Firebase Cloud Messaging HTTP v1 API
// Uses Service Account JSON for OAuth2 authentication

define('FCM_PROJECT_ID', 'yarana-lifeos');
define('FCM_SA_EMAIL', 'firebase-adminsdk-fbsvc@yarana-lifeos.iam.gserviceaccount.com');

// Load private key from service account file
$SA_FILE = __DIR__ . '/firebase-service-account.json';
$FCM_PRIVATE_KEY = null;

if (file_exists($SA_FILE)) {
    $sa = json_decode(file_get_contents($SA_FILE), true);
    $FCM_PRIVATE_KEY = $sa['private_key'] ?? null;
}

/**
 * Generate OAuth2 access token using JWT (Service Account)
 */
function fcm_get_access_token(): ?string {
    global $FCM_PRIVATE_KEY;
    if (!$FCM_PRIVATE_KEY) return null;

    // Build JWT
    $header  = rtrim(strtr(base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])), '+/', '-_'), '=');
    $now     = time();
    $claims  = [
        'iss'   => FCM_SA_EMAIL,
        'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
        'aud'   => 'https://oauth2.googleapis.com/token',
        'exp'   => $now + 3600,
        'iat'   => $now,
    ];
    $payload = rtrim(strtr(base64_encode(json_encode($claims)), '+/', '-_'), '=');

    $pkey = openssl_pkey_get_private($FCM_PRIVATE_KEY);
    if (!$pkey) return null;

    $sig = '';
    openssl_sign("$header.$payload", $sig, $pkey, 'SHA256');
    $jwt = "$header.$payload." . rtrim(strtr(base64_encode($sig), '+/', '-_'), '=');

    // Exchange JWT for access token
    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt_array($ch, [
        CURLOPT_POST        => true,
        CURLOPT_POSTFIELDS  => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER  => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($resp, true);
    return $data['access_token'] ?? null;
}

/**
 * Send FCM push notification to a specific device token
 */
function fcm_send(string $fcm_token, string $title, string $body, array $data = []): bool {
    $access_token = fcm_get_access_token();
    if (!$access_token) {
        error_log('FCM: Could not get access token');
        return false;
    }

    $message = [
        'message' => [
            'token' => $fcm_token,
            'notification' => [
                'title' => $title,
                'body'  => $body,
            ],
            'webpush' => [
                'notification' => [
                    'title'              => $title,
                    'body'               => $body,
                    'icon'               => '/icon-192x192.png',
                    'badge'              => '/icon-192x192.png',
                    'requireInteraction' => true,
                    'vibrate'            => [200, 100, 200],
                ],
                'fcm_options' => ['link' => '/tasks'],
            ],
            'data' => array_map('strval', $data),
        ],
    ];

    $url = 'https://fcm.googleapis.com/v1/projects/' . FCM_PROJECT_ID . '/messages:send';
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($message),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $access_token,
            'Content-Type: application/json',
        ],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code !== 200) {
        error_log("FCM send failed ($code): $resp");
        return false;
    }
    return true;
}
