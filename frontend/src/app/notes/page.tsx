'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { trash } from '@/lib/trash';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Search, Trash2, Edit3, X, BookOpen, Lock, Unlock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const S = {
  inp: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', width: '100%', outline: 'none', fontSize: 14, boxSizing: 'border-box' as const } as React.CSSProperties,
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6 } as React.CSSProperties,
  btn: (bg: string, color = 'white') => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: bg, color, transition: 'opacity 0.15s' } as React.CSSProperties),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 } as React.CSSProperties,
  modal: { background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto' as const, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' } as React.CSSProperties,
};
const CATS = ['all','personal','life_rules','ideas','work'];
const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

// ─── Delete Confirm Modal ─────────────────────────────────────────
function DeleteConfirm({ onCancel, onConfirm, loading }: any) {
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...S.modal, maxWidth: 380, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={28} color="#ef4444" />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'white' }}>Move to Trash?</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>
          Ye note Recycle Bin mein chala jayega. 30 din baad automatically delete hoga.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={onCancel} style={S.btn('rgba(255,255,255,0.08)', '#9ca3af')}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={S.btn('#ef4444')}>🗑️ Trash mein Daalo</button>
        </div>
      </div>
    </div>
  );
}

// ─── Unlock Modal ─────────────────────────────────────────────────
function UnlockModal({ note, onClose, onUnlocked }: any) {
  const [pass, setPass] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const handleUnlock = async (e: any) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res: any = await api.post(`/notes/${note.id}/unlock`, { password: pass });
      onUnlocked(res.content);
    } catch (e: any) { setErr(e?.message || 'Galat password'); }
    setLoading(false);
  };
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Lock size={24} color="#818cf8" />
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'white' }}>🔒 Locked Note</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{note.title}</p>
        </div>
        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <input autoFocus type={show ? 'text' : 'password'} style={{ ...S.inp, paddingRight: 44 }} placeholder="Lock password daalo" value={pass} onChange={e => setPass(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {show ? <EyeOff size={16} color="#6b7280" /> : <Eye size={16} color="#6b7280" />}
            </button>
          </div>
          {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#f87171' }}>{err}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" onClick={onClose} style={S.btn('rgba(255,255,255,0.08)', '#9ca3af')}>Cancel</button>
            <button type="submit" disabled={loading} style={S.btn('#4f46e5')}>
              <Unlock size={15} /> {loading ? 'Checking...' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Preview Modal ─────────────────────────────────────────────────
function PreviewModal({ note, unlockedContent, onClose, onEdit, onDelete }: any) {
  const content = note.is_locked ? unlockedContent : note.content;
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, maxWidth: 560 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: note.color || '#6366f1', flexShrink: 0 }} />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'white' }}>{note.title}</h2>
              {note.is_locked && <Lock size={14} color="#818cf8" />}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', textTransform: 'capitalize' as const }}>
                {note.category?.replace('_', ' ')}
              </span>
              <span style={{ fontSize: 11, color: '#4b5563' }}>{format(new Date(note.updated_at), 'dd MMM yyyy, hh:mm a')}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', flexShrink: 0 }}>
            <X size={16} color="#9ca3af" />
          </button>
        </div>

        {/* Color bar */}
        <div style={{ height: 3, borderRadius: 2, background: note.color || '#6366f1', marginBottom: 20, opacity: 0.6 }} />

        {/* Content */}
        {content ? (
          <div style={{ fontSize: 15, color: '#d1d5db', lineHeight: 1.8, whiteSpace: 'pre-wrap' as const, marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            {content}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center' as const, color: '#4b5563', fontSize: 14, marginBottom: 20 }}>
            📝 Content nahi hai
          </div>
        )}

        {/* Tags */}
        {note.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 20 }}>
            {note.tags.split(',').map((t: string) => (
              <span key={t} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>#{t.trim()}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onDelete} style={{ ...S.btn('rgba(239,68,68,0.1)', '#f87171'), flex: 1, border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={14} /> Trash
          </button>
          <button onClick={onEdit} style={{ ...S.btn('#4f46e5'), flex: 2 }}>
            <Edit3 size={14} /> Edit Karo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit/Create Modal ─────────────────────────────────────────────
function EditModal({ note, onClose, onSave, loading }: any) {
  const [f, setF] = useState({ title: note?.title||'', content: note?.content||'', category: note?.category||'personal', color: note?.color||'#6366f1', tags: note?.tags||'', is_locked: note?.is_locked||false, lock_password: '' });
  const set = (k: string, v: any) => setF(p => ({...p, [k]: v}));
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'white' }}>{note ? '✏️ Note Edit Karo' : '📝 Naya Note'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}><X size={16} color="#9ca3af" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!f.title) { toast.error('Title required'); return; } onSave(f); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={S.label}>Title *</label><input autoFocus style={S.inp} placeholder="Note ka title..." value={f.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label style={S.label}>Content</label><textarea style={{ ...S.inp, height: 110, resize: 'none' as const, fontFamily: 'inherit' }} placeholder="Yahan likho..." value={f.content} onChange={e => set('content', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={S.label}>Category</label>
              <select style={{ ...S.inp, appearance: 'none' as any }} value={f.category} onChange={e => set('category', e.target.value)}>
                <option value="personal">Personal</option><option value="life_rules">Life Rules</option><option value="ideas">Ideas</option><option value="work">Work</option>
              </select></div>
            <div><label style={S.label}>Tags</label><input style={S.inp} placeholder="tag1, tag2" value={f.tags} onChange={e => set('tags', e.target.value)} /></div>
          </div>
          <div><label style={S.label}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {COLORS.map(c => <button key={c} type="button" onClick={() => set('color', c)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: c, transform: f.color===c?'scale(1.3)':'scale(1)', boxShadow: f.color===c?`0 0 0 3px #090912, 0 0 0 5px ${c}`:'none', transition: 'all 0.15s' }} />)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={15} color="#9ca3af" /><span style={{ fontSize: 13, color: '#9ca3af' }}>Note Lock Karo</span></div>
            <button type="button" onClick={() => set('is_locked', !f.is_locked)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: f.is_locked?'#4f46e5':'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 0.2s' }}>
              <span style={{ position: 'absolute', top: 3, left: f.is_locked?22:3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </button>
          </div>
          {f.is_locked && <div><label style={S.label}>Lock Password</label><input type="password" style={S.inp} placeholder={note?.is_locked ? 'Blank = purana password' : 'Password set karo'} value={f.lock_password} onChange={e => set('lock_password', e.target.value)} /></div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" onClick={onClose} style={S.btn('rgba(255,255,255,0.08)', '#9ca3af')}>Cancel</button>
            <button type="submit" disabled={loading} style={S.btn('#4f46e5')}>{loading ? '...' : note ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function NotesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [previewNote, setPreviewNote] = useState<any>(null);
  const [editNote, setEditNote] = useState<any>(null);
  const [unlockNote, setUnlockNote] = useState<any>(null);
  const [deleteNote, setDeleteNote] = useState<any>(null);
  const [unlockedContents, setUnlockedContents] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notes', category, search],
    queryFn: () => api.get('/notes', { params: { ...(category !== 'all' && { category }), ...(search && { search }) } }) as any,
  });

  const createM = useMutation({ mutationFn: (d: any) => api.post('/notes', d), onSuccess: () => { qc.invalidateQueries({queryKey:['notes']}); qc.invalidateQueries({queryKey:['dashboard']}); toast.success('Note save ho gaya! ✅'); setShowCreate(false); }, onError: (e: any) => toast.error(e?.message||'Error') });
  const updateM = useMutation({ mutationFn: ({id,...d}: any) => api.put(`/notes/${id}`, d), onSuccess: () => { qc.invalidateQueries({queryKey:['notes']}); toast.success('Update ho gaya!'); setEditNote(null); setPreviewNote(null); } });
  const deleteM = useMutation({
    mutationFn: async (note: any) => { trash.add('note', note); await api.delete(`/notes/${note.id}`); },
    onSuccess: () => { qc.invalidateQueries({queryKey:['notes']}); qc.invalidateQueries({queryKey:['dashboard']}); toast.success('Trash mein chala gaya 🗑️'); setDeleteNote(null); setPreviewNote(null); },
    onError: (e: any) => toast.error(e?.message||'Delete failed'),
  });

  const notes = (data as any)?.notes || [];

  const handleCardClick = (note: any) => {
    if (note.is_locked && !unlockedContents[note.id]) { setUnlockNote(note); }
    else { setPreviewNote(note); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>📓 Notes</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{notes.length} notes saved</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={S.btn('linear-gradient(135deg,#4f46e5,#7c3aed)')}>
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid transparent', background: category===c?'#4f46e5':'rgba(255,255,255,0.06)', color: category===c?'white':'#9ca3af', textTransform: 'capitalize' as const, transition: 'all 0.15s' }}>
            {c === 'life_rules' ? 'Life Rules' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input style={{ ...S.inp, paddingLeft: 36 }} placeholder="Notes search karo..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {Array(6).fill(0).map((_,i) => <div key={i} style={{ height: 140, borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : notes.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, textAlign: 'center' as const, padding: '48px 20px' }}>
          <BookOpen size={40} color="#374151" style={{ margin: '0 auto 10px' }} />
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 12 }}>Koi note nahi hai</div>
          <button onClick={() => setShowCreate(true)} style={S.btn('#4f46e5')}><Plus size={15} /> Pehla Note Likho</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {notes.map((note: any) => (
            <div key={note.id} onClick={() => handleCardClick(note)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, cursor: 'pointer', borderLeft: `4px solid ${note.color||'#6366f1'}`, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

              {/* Glow */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: '50%', background: note.color||'#6366f1', opacity: 0.08, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    {note.is_locked && <Lock size={12} color="#818cf8" />}
                    {note.is_locked && unlockedContents[note.id] && <Unlock size={12} color="#10b981" />}
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {note.is_locked && !unlockedContents[note.id] ? '🔒 Locked Note' : note.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: 'rgba(107,114,128,0.15)', color: '#9ca3af', textTransform: 'capitalize' as const }}>{note.category?.replace('_',' ')}</span>
                </div>
              </div>

              {/* Content preview */}
              {!note.is_locked && note.content && (
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, lineHeight: 1.6 }}>
                  {note.content}
                </div>
              )}

              {note.is_locked && !unlockedContents[note.id] && (
                <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={11} /> Password se unlock karo
                </div>
              )}

              {/* Tags */}
              {note.tags && <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 6 }}>
                {note.tags.split(',').slice(0,3).map((t: string) => <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#6b7280' }}>#{t.trim()}</span>)}
              </div>}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#374151' }}>{format(new Date(note.updated_at), 'dd MMM yyyy')}</span>
                <span style={{ fontSize: 11, color: '#4b5563', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 20 }}>👁 Preview</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && <EditModal onClose={() => setShowCreate(false)} onSave={(d: any) => createM.mutate(d)} loading={createM.isPending} />}
      {editNote && <EditModal note={editNote} onClose={() => setEditNote(null)} onSave={(d: any) => updateM.mutate({id: editNote.id, ...d})} loading={updateM.isPending} />}

      {unlockNote && (
        <UnlockModal note={unlockNote} onClose={() => setUnlockNote(null)}
          onUnlocked={(content: string) => {
            setUnlockedContents(prev => ({...prev, [unlockNote.id]: content}));
            setPreviewNote(unlockNote);
            setUnlockNote(null);
            toast.success('Unlock ho gaya! 🔓');
          }}
        />
      )}

      {previewNote && (
        <PreviewModal
          note={previewNote}
          unlockedContent={unlockedContents[previewNote.id]}
          onClose={() => setPreviewNote(null)}
          onEdit={() => { setEditNote(previewNote); setPreviewNote(null); }}
          onDelete={() => setDeleteNote(previewNote)}
        />
      )}

      {deleteNote && (
        <DeleteConfirm
          onCancel={() => setDeleteNote(null)}
          onConfirm={() => deleteM.mutate(deleteNote)}
          loading={deleteM.isPending}
        />
      )}
    </div>
  );
}
