<?php
// Routes: GET/POST /tasks | GET/PUT/DELETE /tasks/:id | PATCH /tasks/:id/toggle
$uid = auth_user(); $db = get_db();
$id = is_numeric($p1) ? (int)$p1 : null;
$sub = $p2; // toggle

// PATCH /tasks/:id/toggle
if ($method === 'PATCH' && $id && $sub === 'toggle') {
    $stmt = $db->prepare('SELECT id,status FROM tasks WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    $t = $stmt->fetch(); if (!$t) err('Task not found', 404);
    $ns = $t['status'] === 'pending' ? 'completed' : 'pending';
    $db->prepare('UPDATE tasks SET status=? WHERE id=?')->execute([$ns,$id]);
    ok(['status'=>$ns], 'Task updated');
}

// GET /tasks
if ($method === 'GET' && !$id) {
    $w = ['t.user_id=?']; $par = [$uid];
    if (!empty($_GET['date']))     { $w[] = 't.date=?';          $par[] = $_GET['date']; }
    if (!empty($_GET['status']))   { $w[] = 't.status=?';        $par[] = $_GET['status']; }
    if (!empty($_GET['priority'])) { $w[] = 't.priority=?';      $par[] = $_GET['priority']; }
    if (!empty($_GET['search']))   { $w[] = 't.title LIKE ?';    $par[] = '%'.$_GET['search'].'%'; }
    $sql = 'SELECT * FROM tasks t WHERE '.implode(' AND ',$w).' ORDER BY FIELD(priority,"high","medium","low"), created_at DESC';
    $stmt = $db->prepare($sql); $stmt->execute($par);
    ok(['tasks' => $stmt->fetchAll()]);
}

// POST /tasks
if ($method === 'POST' && !$id) {
    $b = body(); if (empty($b['title'])) err('Title required');
    $db->prepare('INSERT INTO tasks (user_id,title,description,date,priority,reminder_time) VALUES (?,?,?,?,?,?)')
       ->execute([$uid,$b['title'],$b['description']??null,$b['date']??date('Y-m-d'),$b['priority']??'medium',$b['reminder_time']??null]);
    $nid = $db->lastInsertId();
    ok(['task' => $db->query("SELECT * FROM tasks WHERE id=$nid")->fetch()], 'Task created');
}

// PUT /tasks/:id
if ($method === 'PUT' && $id) {
    $stmt = $db->prepare('SELECT id FROM tasks WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->fetch()) err('Not found', 404);
    $b = body();
    $db->prepare('UPDATE tasks SET title=?,description=?,date=?,priority=?,status=?,reminder_time=? WHERE id=?')
       ->execute([$b['title'],$b['description']??null,$b['date']??date('Y-m-d'),$b['priority']??'medium',$b['status']??'pending',$b['reminder_time']??null,$id]);
    ok(['task' => $db->query("SELECT * FROM tasks WHERE id=$id")->fetch()], 'Task updated');
}

// DELETE /tasks/:id
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM tasks WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->rowCount()) err('Not found', 404);
    ok([], 'Task deleted');
}

err('Method not allowed', 405);
