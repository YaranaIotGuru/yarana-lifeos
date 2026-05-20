'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Plus, Search, Trash2, Edit3, X, Users, Phone, Calendar,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const S = {
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 } as React.CSSProperties,
  input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '11px 14px', color: 'white', width: '100%', outline: 'none', fontSize: 14, boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6 } as React.CSSProperties,
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' } as React.CSSProperties,
};

const statusMap: any = {
  pending: { label: 'Pending', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  in_progress: { label: 'In Progress', bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  completed: { label: 'Completed', bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
};
const payMap: any = {
  paid: { label: 'Paid', bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  unpaid: { label: 'Unpaid', bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  partial: { label: 'Partial', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
};

function Badge({ map, val }: { map: any; val: string }) {
  const s = map[val] || { label: val, bg: 'rgba(107,114,128,0.15)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)' };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

function ClientModal({ client, onClose, onSave, loading }: any) {
  const [f, setF] = useState({
    name: client?.name || '', mobile: client?.mobile || '', email: client?.email || '',
    work_description: client?.work_description || '',
    deadline: client?.deadline ? format(new Date(client.deadline), 'yyyy-MM-dd') : '',
    status: client?.status || 'pending', payment_status: client?.payment_status || 'unpaid',
    amount: client?.amount || '', notes: client?.notes || '',
  });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'white' }}>{client ? '✏️ Edit Client' : '👤 Add Client'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
            <X size={16} color="#9ca3af" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!f.name) { toast.error('Name required'); return; } onSave(f); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={S.label}>Client Name *</label>
            <input autoFocus style={S.input} placeholder="Full name" value={f.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={S.label}>Mobile</label><input style={S.input} type="tel" placeholder="Number" value={f.mobile} onChange={e => set('mobile', e.target.value)} /></div>
            <div><label style={S.label}>Email</label><input style={S.input} type="email" placeholder="Email" value={f.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div>
            <label style={S.label}>Work Description</label>
            <textarea style={{ ...S.input, height: 70, resize: 'none', fontFamily: 'inherit' }} placeholder="What needs to be done..." value={f.work_description} onChange={e => set('work_description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={S.label}>Deadline</label><input type="date" style={S.input} value={f.deadline} onChange={e => set('deadline', e.target.value)} /></div>
            <div><label style={S.label}>Amount (₹)</label><input type="number" style={S.input} placeholder="0" value={f.amount} onChange={e => set('amount', e.target.value)} /></div>
            <div>
              <label style={S.label}>Work Status</label>
              <select style={{ ...S.input, appearance: 'none' as any }} value={f.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Payment</label>
              <select style={{ ...S.input, appearance: 'none' as any }} value={f.payment_status} onChange={e => set('payment_status', e.target.value)}>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div><label style={S.label}>Notes</label><textarea style={{ ...S.input, height: 55, resize: 'none', fontFamily: 'inherit' }} placeholder="Notes..." value={f.notes} onChange={e => set('notes', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...S.btn, background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...S.btn, background: '#4f46e5', color: 'white', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : client ? 'Update' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { if (searchParams.get('new') === '1') setShowModal(true); }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', statusFilter, search],
    queryFn: () => {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      return api.get('/clients', { params }) as any;
    },
  });
  const { data: statsData } = useQuery({ queryKey: ['client-stats'], queryFn: () => api.get('/clients/stats') as any });

  const createM = useMutation({ mutationFn: (d: any) => api.post('/clients', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); qc.invalidateQueries({ queryKey: ['client-stats'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Client added!'); setShowModal(false); }, onError: (e: any) => toast.error(e?.message || 'Failed') });
  const updateM = useMutation({ mutationFn: ({ id, ...d }: any) => api.put(`/clients/${id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); qc.invalidateQueries({ queryKey: ['client-stats'] }); toast.success('Updated!'); setEditClient(null); } });
  const deleteM = useMutation({ mutationFn: (id: number) => api.delete(`/clients/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client removed'); } });

  const clients = data?.clients || [];
  const stats = statsData?.stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>Clients</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{clients.length} total</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', boxShadow: '0 2px 12px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        {[
          { label: 'Total', value: stats?.total ?? 0, color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
          { label: 'Active', value: stats?.active ?? 0, color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Completed', value: stats?.completed ?? 0, color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Unpaid', value: `₹${Number(stats?.total_unpaid ?? 0).toLocaleString('en-IN')}`, color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...S.card, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input style={{ ...S.input, paddingLeft: 36 }} placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' },
            { v: 'in_progress', l: 'In Progress' }, { v: 'completed', l: 'Completed' }
          ].map(f => (
            <button key={f.v} onClick={() => setStatusFilter(f.v)} style={{
              padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: '1px solid transparent',
              background: statusFilter === f.v ? '#4f46e5' : 'rgba(255,255,255,0.06)',
              color: statusFilter === f.v ? 'white' : '#9ca3af',
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      {/* Client grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 140, borderRadius: 16, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : clients.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '48px 20px' }}>
          <Users size={40} color="#374151" style={{ margin: '0 auto 10px' }} />
          <div style={{ color: '#6b7280', marginBottom: 12, fontSize: 14 }}>No clients found</div>
          <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', margin: '0 auto' }}>
            <Plus size={15} /> Add Client
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {clients.map((client: any) => (
            <div key={client.id} style={{ ...S.card, transition: 'all 0.2s', cursor: 'default', position: 'relative' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#60a5fa', flexShrink: 0 }}>
                  {client.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                    <Badge map={statusMap} val={client.status} />
                    <Badge map={payMap} val={client.payment_status} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => setEditClient(client)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
                    <Edit3 size={13} color="#818cf8" />
                  </button>
                  <button onClick={() => { if (confirm('Delete?')) deleteM.mutate(client.id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
                    <Trash2 size={13} color="#f87171" />
                  </button>
                </div>
              </div>

              {client.work_description && (
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                  {client.work_description}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {client.mobile && (
                    <a href={`tel:${client.mobile}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280', textDecoration: 'none' }}>
                      <Phone size={11} />{client.mobile}
                    </a>
                  )}
                  {client.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                      <Calendar size={11} />{format(new Date(client.deadline), 'MMM d')}
                    </span>
                  )}
                </div>
                {client.amount > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: client.payment_status === 'paid' ? '#34d399' : '#fbbf24' }}>
                    ₹{Number(client.amount).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ClientModal onClose={() => setShowModal(false)} onSave={(d: any) => createM.mutate(d)} loading={createM.isPending} />}
      {editClient && <ClientModal client={editClient} onClose={() => setEditClient(null)} onSave={(d: any) => updateM.mutate({ id: editClient.id, ...d })} loading={updateM.isPending} />}
    </div>
  );
}
