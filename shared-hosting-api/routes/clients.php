<?php
// Routes: GET/POST /clients | GET /clients/stats | PUT/DELETE /clients/:id
$uid = auth_user(); $db = get_db();
$id = is_numeric($p1) ? (int)$p1 : null;

// GET /clients/stats
if ($method === 'GET' && $p1 === 'stats') {
    $row = $db->query("SELECT
        COUNT(*) as total,
        SUM(status IN ('pending','in_progress')) as active,
        SUM(status='completed') as completed,
        SUM(CASE WHEN payment_status='unpaid' THEN amount ELSE 0 END) as total_unpaid
        FROM clients WHERE user_id=$uid")->fetch();
    ok(['stats' => $row]);
}

// GET /clients
if ($method === 'GET' && !$id) {
    $w = ['user_id=?']; $par = [$uid];
    if (!empty($_GET['status'])) { $w[] = 'status=?'; $par[] = $_GET['status']; }
    if (!empty($_GET['search'])) { $w[] = 'name LIKE ?'; $par[] = '%'.$_GET['search'].'%'; }
    $stmt = $db->prepare('SELECT * FROM clients WHERE '.implode(' AND ',$w).' ORDER BY created_at DESC');
    $stmt->execute($par);
    ok(['clients' => $stmt->fetchAll()]);
}

// POST /clients
if ($method === 'POST' && !$id) {
    $b = body(); if (empty($b['name'])) err('Name required');
    $db->prepare('INSERT INTO clients (user_id,name,mobile,email,work_description,deadline,status,payment_status,amount,notes) VALUES (?,?,?,?,?,?,?,?,?,?)')
       ->execute([$uid,$b['name'],$b['mobile']??null,$b['email']??null,$b['work_description']??null,$b['deadline']??null,$b['status']??'pending',$b['payment_status']??'unpaid',$b['amount']??0,$b['notes']??null]);
    $nid = $db->lastInsertId();
    ok(['client' => $db->query("SELECT * FROM clients WHERE id=$nid")->fetch()], 'Client added');
}

// PUT /clients/:id
if ($method === 'PUT' && $id) {
    $stmt = $db->prepare('SELECT id FROM clients WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->fetch()) err('Not found', 404);
    $b = body();
    $db->prepare('UPDATE clients SET name=?,mobile=?,email=?,work_description=?,deadline=?,status=?,payment_status=?,amount=?,notes=? WHERE id=?')
       ->execute([$b['name'],$b['mobile']??null,$b['email']??null,$b['work_description']??null,$b['deadline']??null,$b['status']??'pending',$b['payment_status']??'unpaid',$b['amount']??0,$b['notes']??null,$id]);
    ok(['client' => $db->query("SELECT * FROM clients WHERE id=$id")->fetch()], 'Client updated');
}

// DELETE /clients/:id
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM clients WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->rowCount()) err('Not found', 404);
    ok([], 'Client deleted');
}

err('Method not allowed', 405);
