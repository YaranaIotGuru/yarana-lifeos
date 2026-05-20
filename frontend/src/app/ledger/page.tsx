'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { trash } from '@/lib/trash';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Search, Trash2, Edit3, X, TrendingUp, TrendingDown, CheckCircle2, Circle, Wallet, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';

const S = {
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 } as React.CSSProperties,
  inp: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', width: '100%', outline: 'none', fontSize: 14, boxSizing: 'border-box' as const } as React.CSSProperties,
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6 } as React.CSSProperties,
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 } as React.CSSProperties,
  modal: { background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto' as const, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' } as React.CSSProperties,
};

// ── Delete Confirm ─────────────────────────────────────────────────
function DeleteConfirm({ item, onCancel, onConfirm, loading }: any) {
  return (
    <div style={{ ...S.overlay, zIndex: 110 }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background:'#13131f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, maxWidth:360, textAlign:'center' as const, boxShadow:'0 25px 60px rgba(0,0,0,0.6)', width:'100%' }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}><AlertTriangle size={26} color="#ef4444" /></div>
        <h3 style={{ margin:'0 0 8px', color:'white', fontSize:17, fontWeight:700 }}>Trash mein Daalen?</h3>
        <p style={{ margin:'0 0 6px', color:'white', fontWeight:600, fontSize:14 }}>"{item?.name}"</p>
        <p style={{ margin:'0 0 22px', color:'#9ca3af', fontSize:13 }}>Recycle Bin mein jayega, 30 din baad auto-delete.</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={onCancel} style={{ padding:'10px', borderRadius:10, border:'none', background:'rgba(255,255,255,0.08)', color:'#9ca3af', cursor:'pointer', fontWeight:500 }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding:'10px', borderRadius:10, border:'none', background:'#ef4444', color:'white', cursor:'pointer', fontWeight:600 }}>🗑️ Trash Karo</button>
        </div>
      </div>
    </div>
  );
}

// ── Entry Preview Modal ────────────────────────────────────────────
function EntryPreview({ entry, onClose, onEdit, onDelete, onSettle }: any) {
  const isCredit = entry.type === 'credit';
  const clr = isCredit ? '#34d399' : '#f87171';
  const bg = isCredit ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {isCredit ? <TrendingUp size={22} color={clr} /> : <TrendingDown size={22} color={clr} />}
            </div>
            <div>
              <div style={{ fontSize:19, fontWeight:700, color:entry.settled?'#6b7280':'white', textDecoration:entry.settled?'line-through':'none' }}>{entry.name}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginTop:4 }}>
                <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:bg, color:clr, fontWeight:600 }}>{isCredit ? '↙ Lena' : '↗ Dena'}</span>
                {entry.settled && <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'rgba(16,185,129,0.15)', color:'#34d399', fontWeight:600 }}>✅ Settled</span>}
                <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'rgba(107,114,128,0.15)', color:'#9ca3af', textTransform:'capitalize' as const }}>{entry.category}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:7, cursor:'pointer', flexShrink:0 }}><X size={16} color="#9ca3af" /></button>
        </div>

        {/* Amount */}
        <div style={{ padding:'20px', background:bg, borderRadius:16, border:`1px solid ${clr}33`, textAlign:'center' as const, marginBottom:16 }}>
          <div style={{ fontSize:11, color:clr, marginBottom:4, textTransform:'uppercase' as const, letterSpacing:'0.1em' }}>{isCredit ? '💰 Lena (To Receive)' : '💸 Dena (To Pay)'}</div>
          <div style={{ fontSize:32, fontWeight:800, color:clr }}>{isCredit?'+':'-'}₹{Number(entry.amount).toLocaleString('en-IN')}</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <div style={{ padding:'12px', background:'rgba(255,255,255,0.04)', borderRadius:12, border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>📅 Date</div>
            <div style={{ fontSize:13, color:'white', fontWeight:500 }}>{entry.date ? format(new Date(entry.date),'dd MMM yyyy') : '—'}</div>
          </div>
          <div style={{ padding:'12px', background:'rgba(255,255,255,0.04)', borderRadius:12, border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>🏷 Category</div>
            <div style={{ fontSize:13, color:'white', fontWeight:500, textTransform:'capitalize' as const }}>{entry.category}</div>
          </div>
        </div>
        {entry.note && <div style={{ padding:'14px', background:'rgba(255,255,255,0.04)', borderRadius:12, border:'1px solid rgba(255,255,255,0.06)', marginBottom:16 }}><div style={{ fontSize:11, color:'#6b7280', marginBottom:6 }}>📝 Note</div><div style={{ fontSize:14, color:'#d1d5db', lineHeight:1.7 }}>{entry.note}</div></div>}

        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onSettle} style={{ ...S.btn, background: entry.settled?'rgba(245,158,11,0.1)':'rgba(16,185,129,0.1)', color:entry.settled?'#fbbf24':'#34d399', border:`1px solid ${entry.settled?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)'}`, flex:1 }}>
            {entry.settled ? <><Circle size={14} /> Unsettle</> : <><CheckCircle2 size={14} /> Settle Karo</>}
          </button>
          <button onClick={onDelete} style={{ ...S.btn, background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', padding:'10px 14px' }}><Trash2 size={14} /></button>
          <button onClick={onEdit} style={{ ...S.btn, background:'#4f46e5', color:'white', flex:1 }}><Edit3 size={14} /> Edit</button>
        </div>
      </div>
    </div>
  );
}

// ── Entry Form Modal ───────────────────────────────────────────────
function EntryModal({ entry, onClose, onSave, loading }: any) {
  const [f, setF] = useState({ name: entry?.name||'', amount: entry?.amount||'', type: entry?.type||'credit', date: entry?.date ? format(new Date(entry.date),'yyyy-MM-dd') : format(new Date(),'yyyy-MM-dd'), note: entry?.note||'', category: entry?.category||'general' });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:600, color:'white' }}>{entry ? '✏️ Edit Entry' : '💰 New Entry'}</h2>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:8, padding:7, cursor:'pointer' }}><X size={16} color="#9ca3af" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!f.name||!f.amount) { toast.error('Name and amount required'); return; } onSave(f); }} style={{ display:'flex', flexDirection:'column' as const, gap:14 }}>
          <div>
            <label style={S.label}>Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[{v:'credit',l:'↙ Lena (Credit)',c:'#34d399'},{v:'debit',l:'↗ Dena (Debit)',c:'#f87171'}].map(t => (
                <button key={t.v} type="button" onClick={() => set('type',t.v)} style={{ padding:'11px 12px', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer', border:f.type===t.v?`1px solid ${t.c}55`:'1px solid rgba(255,255,255,0.1)', background:f.type===t.v?`${t.c}22`:'rgba(255,255,255,0.05)', color:f.type===t.v?t.c:'#6b7280', transition:'all 0.15s' }}>{t.l}</button>
              ))}
            </div>
          </div>
          <div><label style={S.label}>Name / Person *</label><input autoFocus style={S.inp} placeholder="Kaun sa naam?" value={f.name} onChange={e => set('name',e.target.value)} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={S.label}>Amount (₹) *</label><input type="number" style={S.inp} placeholder="0" value={f.amount} onChange={e => set('amount',e.target.value)} /></div>
            <div><label style={S.label}>Date</label><input type="date" style={S.inp} value={f.date} onChange={e => set('date',e.target.value)} /></div>
          </div>
          <div><label style={S.label}>Category</label>
            <select style={{ ...S.inp, appearance:'none' as any }} value={f.category} onChange={e => set('category',e.target.value)}>
              {['general','business','personal','client','investment','loan'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select></div>
          <div><label style={S.label}>Note</label><input style={S.inp} placeholder="Optional note..." value={f.note} onChange={e => set('note',e.target.value)} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ ...S.btn, background:'rgba(255,255,255,0.08)', color:'#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...S.btn, background:'#4f46e5', color:'white', opacity:loading?0.7:1 }}>{loading?'...':entry?'Update':'Add Entry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LedgerPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [previewEntry, setPreviewEntry] = useState<any>(null);
  const [deleteEntry, setDeleteEntry] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [settledFilter, setSettledFilter] = useState('all');

  const { data: summaryData } = useQuery({ queryKey: ['ledger-summary'], queryFn: () => api.get('/ledger/summary') as any });
  const { data, isLoading } = useQuery({
    queryKey: ['ledger', typeFilter, settledFilter, search],
    queryFn: () => { const p: any = {}; if (typeFilter !== 'all') p.type = typeFilter; if (settledFilter !== 'all') p.settled = settledFilter === 'settled'; if (search) p.search = search; return api.get('/ledger', { params: p }) as any; },
  });

  const createM = useMutation({ mutationFn: (d: any) => api.post('/ledger', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Entry added!'); setShowModal(false); }, onError: (e: any) => toast.error(e?.message||'Failed') });
  const updateM = useMutation({ mutationFn: ({ id, ...d }: any) => api.put(`/ledger/${id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); toast.success('Updated!'); setEditEntry(null); setPreviewEntry(null); } });
  const settleM = useMutation({ mutationFn: (id: number) => api.patch(`/ledger/${id}/settle`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); setPreviewEntry(null); } });
  const deleteM = useMutation({
    mutationFn: async (entry: any) => { trash.add('ledger', entry); await api.delete(`/ledger/${entry.id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Trash mein chala gaya 🗑️'); setDeleteEntry(null); setPreviewEntry(null); },
    onError: (e: any) => toast.error(e?.message||'Failed'),
  });

  const entries = (data as any)?.entries || [];
  const summary = (summaryData as any)?.summary;
  const net = Number(summary?.total_lena??0) - Number(summary?.total_dena??0);

  return (
    <div style={{ display:'flex', flexDirection:'column' as const, gap:16, paddingBottom:80 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' as const, gap:10 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:'white' }}>💰 Hisaab Kitab</h1>
          <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>Track who owes you & who you owe</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ ...S.btn, background:'#4f46e5', color:'white', boxShadow:'0 2px 12px rgba(79,70,229,0.3)' }}><Plus size={16} /> Add Entry</button>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:12 }}>
        <div style={{ ...S.card, border:'1px solid rgba(16,185,129,0.2)', background:'rgba(16,185,129,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><ArrowDownCircle size={20} color="#34d399" /></div>
            <div><div style={{ fontSize:13, color:'#6b7280' }}>Total Lena</div><div style={{ fontSize:11, color:'#34d399' }}>To Receive</div></div>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:'#34d399' }}>₹{Number(summary?.total_lena??0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ ...S.card, border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><ArrowUpCircle size={20} color="#f87171" /></div>
            <div><div style={{ fontSize:13, color:'#6b7280' }}>Total Dena</div><div style={{ fontSize:11, color:'#f87171' }}>To Pay</div></div>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:'#f87171' }}>₹{Number(summary?.total_dena??0).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ ...S.card, border:`1px solid ${net>=0?'rgba(99,102,241,0.25)':'rgba(239,68,68,0.25)'}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}><Wallet size={20} color="#818cf8" /></div>
            <div><div style={{ fontSize:13, color:'#6b7280' }}>Net Balance</div><div style={{ fontSize:11, color:net>=0?'#34d399':'#f87171' }}>{net>=0?'Aapke favor mein':'Aap zyada dena hai'}</div></div>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:net>=0?'#34d399':'#f87171' }}>₹{Math.abs(net).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, display:'flex', flexWrap:'wrap' as const, gap:10 }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={15} color="#6b7280" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
          <input style={{ ...S.inp, paddingLeft:36 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const }}>
          {[{v:'all',l:'All'},{v:'credit',l:'🟢 Lena'},{v:'debit',l:'🔴 Dena'}].map(f => (
            <button key={f.v} onClick={() => setTypeFilter(f.v)} style={{ padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid transparent', background:typeFilter===f.v?'#4f46e5':'rgba(255,255,255,0.06)', color:typeFilter===f.v?'white':'#9ca3af' }}>{f.l}</button>
          ))}
          <div style={{ width:1, background:'rgba(255,255,255,0.1)', margin:'0 2px' }} />
          {[{v:'all',l:'All'},{v:'pending',l:'Pending'},{v:'settled',l:'Settled'}].map(f => (
            <button key={f.v} onClick={() => setSettledFilter(f.v)} style={{ padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', border:'1px solid transparent', background:settledFilter===f.v?'#4f46e5':'rgba(255,255,255,0.06)', color:settledFilter===f.v?'white':'#9ca3af' }}>{f.l}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column' as const, gap:8 }}>
          {Array(4).fill(0).map((_,i) => <div key={i} style={{ height:76, borderRadius:14, background:'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ ...S.card, textAlign:'center' as const, padding:'48px 20px' }}>
          <Wallet size={40} color="#374151" style={{ margin:'0 auto 10px' }} />
          <div style={{ color:'#6b7280', marginBottom:12, fontSize:14 }}>Koi entry nahi mili</div>
          <button onClick={() => setShowModal(true)} style={{ ...S.btn, background:'#4f46e5', color:'white', margin:'0 auto' }}><Plus size={15} /> Entry Add Karo</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column' as const, gap:8 }}>
          {entries.map((entry: any) => (
            <div key={entry.id} style={{ ...S.card, display:'flex', alignItems:'center', gap:12, opacity:entry.settled?0.6:1, transition:'all 0.2s', cursor:'pointer', borderLeft:`3px solid ${entry.type==='credit'?'#34d399':'#f87171'}` }}
              onClick={() => setPreviewEntry(entry)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>

              <div style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:entry.type==='credit'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)' }}>
                {entry.type==='credit' ? <TrendingUp size={18} color="#34d399" /> : <TrendingDown size={18} color="#f87171" />}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' as const }}>
                  <span style={{ fontSize:14, fontWeight:600, color:entry.settled?'#6b7280':'white', textDecoration:entry.settled?'line-through':'none' }}>{entry.name}</span>
                  {entry.settled && <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:'rgba(16,185,129,0.15)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)' }}>Settled</span>}
                  <span style={{ fontSize:10, fontWeight:500, padding:'2px 7px', borderRadius:20, background:'rgba(107,114,128,0.15)', color:'#9ca3af', border:'1px solid rgba(107,114,128,0.2)', textTransform:'capitalize' as const }}>{entry.category}</span>
                </div>
                {entry.note && <div style={{ fontSize:12, color:'#6b7280', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{entry.note}</div>}
                <div style={{ fontSize:11, color:'#4b5563', marginTop:3 }}>{entry.date ? format(new Date(entry.date),'MMM d, yyyy') : ''}</div>
              </div>

              <div style={{ textAlign:'right' as const, flexShrink:0 }}>
                <div style={{ fontSize:16, fontWeight:700, color:entry.type==='credit'?'#34d399':'#f87171' }}>{entry.type==='credit'?'+':'-'}₹{Number(entry.amount).toLocaleString('en-IN')}</div>
                <div style={{ fontSize:11, color:'#4b5563' }}>{entry.type==='credit'?'to receive':'to pay'}</div>
              </div>

              <span style={{ fontSize:11, color:'#374151', flexShrink:0, background:'rgba(255,255,255,0.04)', padding:'3px 8px', borderRadius:20 }}>👁</span>
            </div>
          ))}
        </div>
      )}

      {showModal && <EntryModal onClose={() => setShowModal(false)} onSave={(d: any) => createM.mutate(d)} loading={createM.isPending} />}
      {editEntry && <EntryModal entry={editEntry} onClose={() => setEditEntry(null)} onSave={(d: any) => updateM.mutate({ id: editEntry.id, ...d })} loading={updateM.isPending} />}
      {previewEntry && <EntryPreview entry={previewEntry} onClose={() => setPreviewEntry(null)} onEdit={() => { setEditEntry(previewEntry); setPreviewEntry(null); }} onDelete={() => setDeleteEntry(previewEntry)} onSettle={() => settleM.mutate(previewEntry.id)} />}
      {deleteEntry && <DeleteConfirm item={deleteEntry} onCancel={() => setDeleteEntry(null)} onConfirm={() => deleteM.mutate(deleteEntry)} loading={deleteM.isPending} />}
    </div>
  );
}
