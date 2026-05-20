'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Plus, Search, Trash2, Edit3, X, TrendingUp, TrendingDown,
  CheckCircle2, Circle, Wallet, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';

const S = {
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 } as React.CSSProperties,
  input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', width: '100%', outline: 'none', fontSize: 14, boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6 } as React.CSSProperties,
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' } as React.CSSProperties,
};

function EntryModal({ entry, onClose, onSave, loading }: any) {
  const [f, setF] = useState({
    name: entry?.name || '', amount: entry?.amount || '', type: entry?.type || 'credit',
    date: entry?.date ? format(new Date(entry.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    note: entry?.note || '', category: entry?.category || 'general',
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'white' }}>{entry ? '✏️ Edit Entry' : '💰 New Entry'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
            <X size={16} color="#9ca3af" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!f.name || !f.amount) { toast.error('Name and amount required'); return; } onSave(f); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type toggle */}
          <div>
            <label style={S.label}>Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { v: 'credit', l: '↙ Lena (Credit)', color: '#34d399', bg: f.type === 'credit' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: f.type === 'credit' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)' },
                { v: 'debit', l: '↗ Dena (Debit)', color: '#f87171', bg: f.type === 'debit' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', border: f.type === 'debit' ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)' },
              ].map(t => (
                <button key={t.v} type="button" onClick={() => set('type', t.v)} style={{
                  padding: '11px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: t.border, background: t.bg,
                  color: f.type === t.v ? t.color : '#6b7280', transition: 'all 0.15s',
                }}>{t.l}</button>
              ))}
            </div>
          </div>
          <div><label style={S.label}>Name / Person *</label><input autoFocus style={S.input} placeholder="Who gave / who to pay" value={f.name} onChange={e => set('name', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={S.label}>Amount (₹) *</label><input type="number" style={S.input} placeholder="0" value={f.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div><label style={S.label}>Date</label><input type="date" style={S.input} value={f.date} onChange={e => set('date', e.target.value)} /></div>
          </div>
          <div>
            <label style={S.label}>Category</label>
            <select style={{ ...S.input, appearance: 'none' as any }} value={f.category} onChange={e => set('category', e.target.value)}>
              {['general', 'business', 'personal', 'client', 'investment', 'loan'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div><label style={S.label}>Note</label><input style={S.input} placeholder="Optional note..." value={f.note} onChange={e => set('note', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...S.btn, background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...S.btn, background: '#4f46e5', color: 'white', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : entry ? 'Update' : 'Add Entry'}
            </button>
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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [settledFilter, setSettledFilter] = useState('all');

  const { data: summaryData } = useQuery({ queryKey: ['ledger-summary'], queryFn: () => api.get('/ledger/summary') as any });
  const { data, isLoading } = useQuery({
    queryKey: ['ledger', typeFilter, settledFilter, search],
    queryFn: () => {
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (settledFilter !== 'all') params.settled = settledFilter === 'settled';
      if (search) params.search = search;
      return api.get('/ledger', { params }) as any;
    },
  });

  const createM = useMutation({ mutationFn: (d: any) => api.post('/ledger', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Entry added!'); setShowModal(false); }, onError: (e: any) => toast.error(e?.message || 'Failed') });
  const updateM = useMutation({ mutationFn: ({ id, ...d }: any) => api.put(`/ledger/${id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); toast.success('Updated!'); setEditEntry(null); } });
  const settleM = useMutation({ mutationFn: (id: number) => api.patch(`/ledger/${id}/settle`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); } });
  const deleteM = useMutation({ mutationFn: (id: number) => api.delete(`/ledger/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); qc.invalidateQueries({ queryKey: ['ledger-summary'] }); toast.success('Deleted'); } });

  const entries = data?.entries || [];
  const summary = summaryData?.summary;
  const net = Number(summary?.total_lena ?? 0) - Number(summary?.total_dena ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>Hisaab Kitab</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Track who owes you & who you owe</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', boxShadow: '0 2px 12px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ ...S.card, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownCircle size={20} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Total Lena</div>
              <div style={{ fontSize: 11, color: '#34d399' }}>To Receive</div>
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#34d399' }}>₹{Number(summary?.total_lena ?? 0).toLocaleString('en-IN')}</div>
        </div>

        <div style={{ ...S.card, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpCircle size={20} color="#f87171" />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Total Dena</div>
              <div style={{ fontSize: 11, color: '#f87171' }}>To Pay</div>
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#f87171' }}>₹{Number(summary?.total_dena ?? 0).toLocaleString('en-IN')}</div>
        </div>

        <div style={{ ...S.card, border: `1px solid ${net >= 0 ? 'rgba(99,102,241,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Net Balance</div>
              <div style={{ fontSize: 11, color: net >= 0 ? '#34d399' : '#f87171' }}>{net >= 0 ? 'In your favor' : 'You owe more'}</div>
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: net >= 0 ? '#34d399' : '#f87171' }}>₹{Math.abs(net).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input style={{ ...S.input, paddingLeft: 36 }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{ v: 'all', l: 'All' }, { v: 'credit', l: '🟢 Lena' }, { v: 'debit', l: '🔴 Dena' }].map(f => (
            <button key={f.v} onClick={() => setTypeFilter(f.v)} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid transparent', background: typeFilter === f.v ? '#4f46e5' : 'rgba(255,255,255,0.06)', color: typeFilter === f.v ? 'white' : '#9ca3af' }}>{f.l}</button>
          ))}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
          {[{ v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'settled', l: 'Settled' }].map(f => (
            <button key={f.v} onClick={() => setSettledFilter(f.v)} style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid transparent', background: settledFilter === f.v ? '#4f46e5' : 'rgba(255,255,255,0.06)', color: settledFilter === f.v ? 'white' : '#9ca3af' }}>{f.l}</button>
          ))}
        </div>
      </div>

      {/* Entries list */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 76, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '48px 20px' }}>
          <Wallet size={40} color="#374151" style={{ margin: '0 auto 10px' }} />
          <div style={{ color: '#6b7280', marginBottom: 12, fontSize: 14 }}>No entries found</div>
          <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', margin: '0 auto' }}>
            <Plus size={15} /> Add Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry: any) => (
            <div key={entry.id} style={{
              ...S.card, display: 'flex', alignItems: 'center', gap: 12,
              opacity: entry.settled ? 0.6 : 1, transition: 'all 0.2s',
              borderLeft: `3px solid ${entry.type === 'credit' ? '#34d399' : '#f87171'}`,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = entry.type === 'credit' ? '#34d399' : '#f87171'}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = entry.type === 'credit' ? '#34d399' : '#f87171'; (e.currentTarget as HTMLElement).style.borderTopColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderRightColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: entry.type === 'credit' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                {entry.type === 'credit' ? <TrendingUp size={18} color="#34d399" /> : <TrendingDown size={18} color="#f87171" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: entry.settled ? '#6b7280' : 'white', textDecoration: entry.settled ? 'line-through' : 'none' }}>{entry.name}</span>
                  {entry.settled && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>Settled</span>}
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.2)', textTransform: 'capitalize' }}>{entry.category}</span>
                </div>
                {entry.note && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.note}</div>}
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>{format(new Date(entry.date), 'MMM d, yyyy')}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: entry.type === 'credit' ? '#34d399' : '#f87171' }}>
                  {entry.type === 'credit' ? '+' : '-'}₹{Number(entry.amount).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: '#4b5563' }}>{entry.type === 'credit' ? 'to receive' : 'to pay'}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => settleM.mutate(entry.id)} title={entry.settled ? 'Unsettle' : 'Mark settled'} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
                  {entry.settled ? <Circle size={13} color="#34d399" /> : <CheckCircle2 size={13} color="#34d399" />}
                </button>
                <button onClick={() => setEditEntry(entry)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
                  <Edit3 size={13} color="#818cf8" />
                </button>
                <button onClick={() => { if (confirm('Delete?')) deleteM.mutate(entry.id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
                  <Trash2 size={13} color="#f87171" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <EntryModal onClose={() => setShowModal(false)} onSave={(d: any) => createM.mutate(d)} loading={createM.isPending} />}
      {editEntry && <EntryModal entry={editEntry} onClose={() => setEditEntry(null)} onSave={(d: any) => updateM.mutate({ id: editEntry.id, ...d })} loading={updateM.isPending} />}
    </div>
  );
}
