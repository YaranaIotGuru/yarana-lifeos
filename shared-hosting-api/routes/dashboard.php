<?php
// GET /dashboard
$uid = auth_user(); $db = get_db();
$today = date('Y-m-d');

$task_stats = $db->query("SELECT
    SUM(date='$today' AND status='pending')   as today_pending,
    SUM(date='$today' AND status='completed') as today_completed,
    SUM(status='pending') as total_pending
    FROM tasks WHERE user_id=$uid")->fetch();

$client_stats = $db->query("SELECT
    SUM(status IN ('pending','in_progress')) as active,
    SUM(CASE WHEN payment_status='unpaid' THEN amount ELSE 0 END) as pending_amount
    FROM clients WHERE user_id=$uid")->fetch();

$ledger_summary = $db->query("SELECT
    SUM(CASE WHEN type='credit' AND settled=0 THEN amount ELSE 0 END) as total_lena,
    SUM(CASE WHEN type='debit'  AND settled=0 THEN amount ELSE 0 END) as total_dena
    FROM ledger WHERE user_id=$uid")->fetch();

$today_tasks = $db->query("SELECT * FROM tasks WHERE user_id=$uid AND date='$today' ORDER BY FIELD(priority,'high','medium','low')")->fetchAll();

$pending_clients = $db->query("SELECT * FROM clients WHERE user_id=$uid AND status IN ('pending','in_progress') LIMIT 5")->fetchAll();

$recent_notes = $db->query("SELECT id,title,category,color,is_locked,updated_at FROM notes WHERE user_id=$uid ORDER BY updated_at DESC LIMIT 5")->fetchAll();

ok([
    'dashboard' => [
        'task_stats'     => $task_stats,
        'client_stats'   => $client_stats,
        'ledger_summary' => $ledger_summary,
        'today_tasks'    => $today_tasks,
        'pending_clients'=> $pending_clients,
        'recent_notes'   => $recent_notes,
    ]
]);
