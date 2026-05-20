<?php
// Routes: GET/POST /notes | PUT/DELETE /notes/:id
$uid = auth_user(); $db = get_db();
$id  = is_numeric($p1) ? (int)$p1 : null;

// GET /notes
if ($method === 'GET' && !$id) {
    $w = ['user_id=?']; $par = [$uid];
    if (!empty($_GET['category'])) { $w[] = 'category=?'; $par[] = $_GET['category']; }
    if (!empty($_GET['search']))   { $w[] = '(title LIKE ? OR content LIKE ?)'; $par[] = '%'.$_GET['search'].'%'; $par[] = '%'.$_GET['search'].'%'; }
    $stmt = $db->prepare('SELECT id,user_id,title,category,color,tags,is_locked,created_at,updated_at, IF(is_locked=1, NULL, content) as content FROM notes WHERE '.implode(' AND ',$w).' ORDER BY updated_at DESC');
    $stmt->execute($par);
    ok(['notes' => $stmt->fetchAll()]);
}

// POST /notes
if ($method === 'POST' && !$id) {
    $b = body(); if (empty($b['title'])) err('Title required');
    $lock_hash = null;
    if (!empty($b['is_locked']) && !empty($b['lock_password'])) $lock_hash = password_hash($b['lock_password'], PASSWORD_BCRYPT);
    $db->prepare('INSERT INTO notes (user_id,title,content,category,color,tags,is_locked,lock_hash) VALUES (?,?,?,?,?,?,?,?)')
       ->execute([$uid,$b['title'],$b['content']??null,$b['category']??'personal',$b['color']??'#6366f1',$b['tags']??null,!empty($b['is_locked'])?1:0,$lock_hash]);
    $nid = $db->lastInsertId();
    ok(['note' => $db->query("SELECT * FROM notes WHERE id=$nid")->fetch()], 'Note saved');
}

// PUT /notes/:id
if ($method === 'PUT' && $id) {
    $stmt = $db->prepare('SELECT * FROM notes WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    $note = $stmt->fetch(); if (!$note) err('Not found', 404);
    $b = body();
    $lock_hash = $note['lock_hash'];
    if (!empty($b['is_locked']) && !empty($b['lock_password'])) $lock_hash = password_hash($b['lock_password'], PASSWORD_BCRYPT);
    $db->prepare('UPDATE notes SET title=?,content=?,category=?,color=?,tags=?,is_locked=?,lock_hash=? WHERE id=?')
       ->execute([$b['title'],$b['content']??null,$b['category']??'personal',$b['color']??'#6366f1',$b['tags']??null,!empty($b['is_locked'])?1:0,$lock_hash,$id]);
    ok(['note' => $db->query("SELECT * FROM notes WHERE id=$id")->fetch()], 'Note updated');
}

// DELETE /notes/:id
if ($method === 'DELETE' && $id) {
    $stmt = $db->prepare('DELETE FROM notes WHERE id=? AND user_id=?'); $stmt->execute([$id,$uid]);
    if (!$stmt->rowCount()) err('Not found', 404);
    ok([], 'Note deleted');
}

err('Method not allowed', 405);
