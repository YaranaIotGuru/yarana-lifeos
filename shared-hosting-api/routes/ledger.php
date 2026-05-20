<?php
// Routes: GET/POST /ledger | GET /ledger/summary | PATCH /ledger/:id/settle | PUT/DELETE /ledger/:id
$uid = auth_user(); $db = get_db();
$id  = is_numeric($p1) ? (int)$p1 : null;
$sub = $p2; // settle

// GET /ledger/summary
if ($method === 'GET' && $p1 === 'summary') {
    $row = $db->query("SELECT
        SUM(CASE WHEN type='credit' AND settled=0 THEN amount ELSE 0 END) as total_lena,
        SUM(CASE WHEN type='debit'  AND settled=0 THEN amount ELSE 0 END) as total_dena
        FROM ledger WHERE user_id=$uid")->fetch();
    ok(['summary' => $row]);
}

// PATCH /ledger/:id/settle
if ($method === 'PATCH' && $id && $sub === 'settle') {
    $stmt = $db->prepare('SELECT id,settled FROM ledger WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    $e = $stmt->fetch(); if (!$e) err('Not found', 404);
    $ns = $e['settled'] ? 0 : 1;
    $db->prepare('UPDATE ledger SET settled=? WHERE id=?')->execute([$ns,$id]);
    ok(['settled' => (bool)$ns], 'Updated');
}

// GET /ledger
if ($method === 'GET' && !$id) {
    $w = ['user_id=?']; $par = [$uid];
    if (!empty($_GET['type']))    { $w[] = 'type=?';    $par[] = $_GET['type']; }
    if (!empty($_GET['search']))  { $w[] = 'name LIKE ?'; $par[] = '%'.$_GET['search'].'%'; }
    if (isset($_GET['settled']))  { $w[] = 'settled=?'; $par[] = $_GET['settled']==='true' ? 1 : 0; }
    $stmt = $db->prepare('SELECT * FROM ledger WHERE '.implode(' AND ',$w).' ORDER BY date DESC, created_at DESC');
    $stmt->execute($par);
    ok(['entries' => $stmt->fetchAll()]);
}

// POST /ledger
if ($method === 'POST' && !$id) {
    $b = body(); if (empty($b['name']) || !isset($b['amount'])) err('Name and amount required');
    $db->prepare('INSERT INTO ledger (user_id,name,amount,type,date,note,category) VALUES (?,?,?,?,?,?,?)')
       ->execute([$uid,$b['name'],$b['amount'],$b['type']??'credit',$b['date']??date('Y-m-d'),$b['note']??null,$b['category']??'general']);
    $nid = $db->lastInsertId();
    ok(['entry' => $db->query("SELECT * FROM ledger WHERE id=$nid")->fetch()], 'Entry added');
}

// PUT /ledger/:id
if ($method === 'PUT' && $id) {
    $stmt = $db->prepare('SELECT id FROM ledger WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->fetch()) err('Not found', 404);
    $b = body();
    $db->prepare('UPDATE ledger SET name=?,amount=?,type=?,date=?,note=?,category=? WHERE id=?')
       ->execute([$b['name'],$b['amount'],$b['type']??'credit',$b['date']??date('Y-m-d'),$b['note']??null,$b['category']??'general',$id]);
    ok(['entry' => $db->query("SELECT * FROM ledger WHERE id=$id")->fetch()], 'Updated');
}

// DELETE /ledger/:id
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM ledger WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->rowCount()) err('Not found', 404);
    ok([], 'Deleted');
}

err('Method not allowed', 405);
