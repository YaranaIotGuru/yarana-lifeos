'use client';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { trash, TrashItem } from '@/lib/trash';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Trash2, RotateCcw, AlertTriangle, X } from 'lucide-react';

const TYPE_LABELS: Record<string, { icon: string; color: string; label: string }> = {
  note:   { icon: '📓', color: '#8b5cf6', label: 'Note' },
  task:   { icon: '✅', color: '#3b82f6', label: 'Task' },
  client: { icon: '👤', color: '#10b981', label: 'Client' },
  ledger: { icon: '💰', color: '#f59e0b', label: 'Ledger' },
};

const RESTORE_ENDPOINTS: Record<string, (d: any) => any> = {
  note:   (d) => api.post('/notes',   { title: d.title, content: d.content, category: d.category, color: d.color, tags: d.tags }),
  task:   (d) => api.post('/tasks',   { title: d.title, description: d.description, date: d.date, priority: d.priority }),
  client: (d) => api.post('/clients', { name: d.name, mobile: d.mobile, email: d.email, work_description: d.work_description, amount: d.amount }),
  ledger: (d) => api.post('/ledger',  { name: d.name, amount: d.amount, type: d.type, date: d.date, note: d.note }),
};

function getName(item: TrashItem) {
  return item.data.title || item.data.name || 'Unnamed';
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => { setItems(trash.getAll()); }, []);

  const handleRestore = async (item: TrashItem) => {
    setLoading(item.id);
    try {
      await RESTORE_ENDPOINTS[item.type](item.data);
      trash.remove(item.id);
      setItems(trash.getAll());
      qc.invalidateQueries({ queryKey: [item.type + 's'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`${TYPE_LABELS[item.type].label} restore ho gaya! ✅`);
    } catch { toast.error('Restore failed'); }
    setLoading(null);
  };

  const handlePermanentDelete = (item: TrashItem) => {
    trash.remove(item.id);
    setItems(trash.getAll());
    toast.success('Permanently delete ho gaya');
  };

  const handleClearAll = () => {
    trash.clear();
    setItems([]);
    setConfirmClear(false);
    toast.success('Recycle Bin saaf ho gaya 🧹');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>🗑️ Recycle Bin</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{items.length} items • 30 din baad auto-delete</div>
        </div>
        {items.length > 0 && (
          <button onClick={() => setConfirmClear(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 11, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
            <Trash2 size={15} /> Sab Delete Karo
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, textAlign: 'center' as const, padding: '64px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ color: 'white', fontWeight: 600, marginBottom: 6 }}>Recycle Bin Khali Hai!</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Delete ki hui cheezein yahan aayengi</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
          {items.map((item) => {
            const meta = TYPE_LABELS[item.type];
            const daysLeft = Math.ceil((new Date(item.deletedAt).getTime() + 30*24*60*60*1000 - Date.now()) / (24*60*60*1000));
            return (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Icon */}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${meta.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {meta.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{getName(item)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{format(new Date(item.deletedAt), 'dd MMM, hh:mm a')}</span>
                    <span style={{ fontSize: 11, color: daysLeft <= 5 ? '#ef4444' : '#6b7280' }}>⏱ {daysLeft} din baaki</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleRestore(item)} disabled={loading === item.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                    <RotateCcw size={13} /> {loading === item.id ? '...' : 'Restore'}
                  </button>
                  <button onClick={() => handlePermanentDelete(item)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Confirm */}
      {confirmClear && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, maxWidth: 360, textAlign: 'center' as const }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <AlertTriangle size={26} color="#ef4444" />
            </div>
            <h3 style={{ margin: '0 0 8px', color: 'white', fontSize: 17, fontWeight: 700 }}>Sab Permanently Delete?</h3>
            <p style={{ margin: '0 0 22px', color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>Ye action undo nahi ho sakta। Saare {items.length} items permanently delete ho jayenge।</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setConfirmClear(false)} style={{ padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#9ca3af', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={handleClearAll} style={{ padding: '10px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Haan, Delete Karo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
