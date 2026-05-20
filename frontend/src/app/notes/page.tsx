'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Search, Trash2, Edit3, X, BookOpen, Lock, Lightbulb, User, Briefcase, Star } from 'lucide-react';

const S = {
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 } as React.CSSProperties,
  input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', width: '100%', outline: 'none', fontSize: 14, boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6 } as React.CSSProperties,
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' } as React.CSSProperties,
};

const CATEGORIES = [
  { value: 'all', label: 'All', color: '#9ca3af' },
  { value: 'personal', label: 'Personal', color: '#f472b6' },
  { value: 'life_rules', label: 'Life Rules', color: '#fbbf24' },
  { value: 'ideas', label: 'Ideas', color: '#facc15' },
  { value: 'work', label: 'Work', color: '#60a5fa' },
];

const NOTE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

function NoteModal({ note, onClose, onSave, loading }: any) {
  const [f, setF] = useState({
    title: note?.title || '', content: note?.content || '',
    category: note?.category || 'personal', color: note?.color || '#6366f1',
    tags: note?.tags || '', is_locked: note?.is_locked || false, lock_password: '',
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'white' }}>{note ? '✏️ Edit Note' : '📝 New Note'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
            <X size={16} color="#9ca3af" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!f.title) { toast.error('Title required'); return; } if (f.is_locked && !note && !f.lock_password) { toast.error('Set a lock password'); return; } onSave(f); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={S.label}>Title *</label><input autoFocus style={S.input} placeholder="Note title..." value={f.title} onChange={e => set('title', e.target.value)} /></div>
          <div>
            <label style={S.label}>Content</label>
            <textarea style={{ ...S.input, height: 100, resize: 'none', fontFamily: 'inherit' }} placeholder="Write your note here..." value={f.content} onChange={e => set('content', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Category</label>
              <select style={{ ...S.input, appearance: 'none' as any }} value={f.category} onChange={e => set('category', e.target.value)}>
                <option value="personal">Personal</option>
                <option value="life_rules">Life Rules</option>
                <option value="ideas">Ideas</option>
                <option value="work">Work</option>
              </select>
            </div>
            <div><label style={S.label}>Tags</label><input style={S.input} placeholder="tag1, tag2" value={f.tags} onChange={e => set('tags', e.target.value)} /></div>
          </div>
          {/* Color picker */}
          <div>
            <label style={S.label}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {NOTE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)} style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: c, transform: f.color === c ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: f.color === c ? `0 0 0 2px #090912, 0 0 0 4px ${c}` : 'none',
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>
          </div>
          {/* Lock */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={15} color="#9ca3af" />
              <span style={{ fontSize: 13, color: '#9ca3af' }}>Lock this note</span>
            </div>
            <button type="button" onClick={() => set('is_locked', !f.is_locked)} style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: f.is_locked ? '#4f46e5' : 'rgba(255,255,255,0.12)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: 3,
                left: f.is_locked ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
          {f.is_locked && (
            <div><label style={S.label}>Lock Password</label><input type="password" style={S.input} placeholder={note?.is_locked ? 'Leave blank to keep current' : 'Set password'} value={f.lock_password} onChange={e => set('lock_password', e.target.value)} /></div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...S.btn, background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...S.btn, background: '#4f46e5', color: 'white', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : note ? 'Update' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notes', category, search],
    queryFn: () => {
      const params: any = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      return api.get('/notes', { params }) as any;
    },
  });

  const createM = useMutation({ mutationFn: (d: any) => api.post('/notes', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Note saved!'); setShowModal(false); }, onError: (e: any) => toast.error(e?.message || 'Failed') });
  const updateM = useMutation({ mutationFn: ({ id, ...d }: any) => api.put(`/notes/${id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Updated!'); setEditNote(null); } });
  const deleteM = useMutation({ mutationFn: (id: number) => api.delete(`/notes/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Deleted'); } });

  const notes = data?.notes || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>Notes</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{notes.length} notes saved</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', boxShadow: '0 2px 12px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.15s',
            background: category === cat.value ? '#4f46e5' : 'rgba(255,255,255,0.06)',
            color: category === cat.value ? 'white' : '#9ca3af',
          }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input style={{ ...S.input, paddingLeft: 36 }} placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Notes grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} style={{ height: 140, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '48px 20px' }}>
          <BookOpen size={40} color="#374151" style={{ margin: '0 auto 10px' }} />
          <div style={{ color: '#6b7280', marginBottom: 12, fontSize: 14 }}>No notes yet</div>
          <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', margin: '0 auto' }}>
            <Plus size={15} /> Write your first note
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {notes.map((note: any) => (
            <div key={note.id} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 16, cursor: 'pointer',
              borderLeft: `4px solid ${note.color || '#6366f1'}`,
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
              onClick={() => !note.is_locked && setEditNote(note)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {/* Color glow */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: note.color || '#6366f1', opacity: 0.07, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {note.is_locked && <Lock size={12} color="#6b7280" />}
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.is_locked ? '🔒 Locked Note' : note.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.2)', textTransform: 'capitalize' }}>
                    {note.category?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                  {!note.is_locked && (
                    <button onClick={e => { e.stopPropagation(); setEditNote(note); }} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, padding: 6, cursor: 'pointer' }}>
                      <Edit3 size={12} color="#818cf8" />
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) deleteM.mutate(note.id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: 6, cursor: 'pointer' }}>
                    <Trash2 size={12} color="#f87171" />
                  </button>
                </div>
              </div>

              {!note.is_locked && note.content && (
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, lineHeight: 1.6 }}>
                  {note.content}
                </div>
              )}

              {note.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {note.tags.split(',').slice(0, 3).map((tag: string) => (
                    <span key={tag} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#6b7280' }}>#{tag.trim()}</span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 'auto' }}>
                {format(new Date(note.updated_at), 'MMM d, yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <NoteModal onClose={() => setShowModal(false)} onSave={(d: any) => createM.mutate(d)} loading={createM.isPending} />}
      {editNote && <NoteModal note={editNote} onClose={() => setEditNote(null)} onSave={(d: any) => updateM.mutate({ id: editNote.id, ...d })} loading={updateM.isPending} />}
    </div>
  );
}
