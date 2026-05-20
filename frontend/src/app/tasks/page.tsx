'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Plus, Search, CheckCircle2, Circle, Trash2, Edit3,
  Clock, X, Target, Calendar, Bell, Filter
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const S = {
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  } as React.CSSProperties,
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '11px 14px',
    color: 'white',
    width: '100%',
    outline: 'none',
    fontSize: 14,
    boxSizing: 'border-box',
  } as React.CSSProperties,
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#9ca3af', marginBottom: 6 } as React.CSSProperties,
  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 18px', borderRadius: 11, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s ease',
  } as React.CSSProperties,
};

const priorityColors: any = {
  high: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.25)', dot: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  low: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
};

function FilterBtn({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
      cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.15s ease',
      background: active ? '#4f46e5' : 'rgba(255,255,255,0.06)',
      color: active ? 'white' : '#9ca3af',
    }}>
      {label}
    </button>
  );
}

function TaskModal({ task, onClose, onSave, loading }: any) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    date: task?.date ? format(new Date(task.date), 'yyyy-MM-dd') : today,
    priority: task?.priority || 'medium',
    reminder_time: task?.reminder_time ? format(new Date(task.reminder_time), "yyyy-MM-dd'T'HH:mm") : '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#13131f', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: 24, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'white' }}>
            {task ? '✏️ Edit Task' : '✨ New Task'}
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}>
            <X size={16} color="#9ca3af" />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (!form.title) { toast.error('Title required'); return; } onSave(form); }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={S.label}>Task Title *</label>
            <input autoFocus style={S.input} placeholder="What needs to be done?" value={form.title}
              onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Description</label>
            <textarea style={{ ...S.input, height: 80, resize: 'none', fontFamily: 'inherit' }}
              placeholder="Optional details..." value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Date</label>
              <input type="date" style={S.input} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Priority</label>
              <select style={{ ...S.input, appearance: 'none' }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div>
            <label style={S.label}><Bell size={12} style={{ display: 'inline', marginRight: 4 }} />Reminder</label>
            <input type="datetime-local" style={S.input} value={form.reminder_time} onChange={e => set('reminder_time', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...S.btn, background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...S.btn, background: '#4f46e5', color: 'white', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : task ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => { if (searchParams.get('new') === '1') setShowModal(true); }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', selectedDate, status, priority, search],
    queryFn: () => {
      const params: any = {};
      if (selectedDate) params.date = selectedDate;
      if (status !== 'all') params.status = status;
      if (priority !== 'all') params.priority = priority;
      if (search) params.search = search;
      return api.get('/tasks', { params }) as any;
    },
  });

  const createM = useMutation({
    mutationFn: (d: any) => api.post('/tasks', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('Task added! ✅'); setShowModal(false); },
    onError: (e: any) => toast.error(e?.message || 'Failed'),
  });
  const updateM = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/tasks/${id}`, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Updated!'); setEditTask(null); },
  });
  const toggleM = useMutation({
    mutationFn: (id: number) => api.patch(`/tasks/${id}/toggle`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); },
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Deleted'); },
  });

  const tasks = data?.tasks || [];
  const pending = tasks.filter((t: any) => t.status === 'pending').length;
  const done = tasks.filter((t: any) => t.status === 'completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>Task Manager</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{pending} pending · {done} completed</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', boxShadow: '0 2px 12px rgba(79,70,229,0.3)' }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input style={{ ...S.input, paddingLeft: 36 }} placeholder="Search tasks..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" style={{ ...S.input, width: 'auto', minWidth: 140 }} value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'pending', 'completed'].map(s => (
            <FilterBtn key={s} label={s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)} active={status === s} onClick={() => setStatus(s)} />
          ))}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          {['all', 'high', 'medium', 'low'].map(p => (
            <FilterBtn key={p} label={p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)} active={priority === p} onClick={() => setPriority(p)} />
          ))}
        </div>
      </div>

      {/* Tasks */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array(4).fill(0).map((_, i) => <div key={i} style={{ height: 72, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: '48px 20px' }}>
          <Target size={40} color="#374151" style={{ margin: '0 auto 10px' }} />
          <div style={{ color: '#6b7280', marginBottom: 12, fontSize: 14 }}>No tasks found</div>
          <button onClick={() => setShowModal(true)} style={{ ...S.btn, background: '#4f46e5', color: 'white', margin: '0 auto' }}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task: any) => {
            const pc = priorityColors[task.priority] || priorityColors.medium;
            return (
              <div key={task.id} style={{
                ...S.card,
                display: 'flex', alignItems: 'flex-start', gap: 12,
                opacity: task.status === 'completed' ? 0.65 : 1,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <button onClick={() => toggleM.mutate(task.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', flexShrink: 0 }}>
                  {task.status === 'completed'
                    ? <CheckCircle2 size={22} color="#34d399" />
                    : <Circle size={22} color="#4b5563" />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: pc.dot, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{
                      fontSize: 14, fontWeight: 500, color: task.status === 'completed' ? '#6b7280' : 'white',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`,
                      textTransform: 'capitalize',
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Calendar size={11} />{format(new Date(task.date), 'MMM d, yyyy')}
                    </span>
                    {task.reminder_time && (
                      <span style={{ fontSize: 11, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} />{format(new Date(task.reminder_time), 'h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => setEditTask(task)} style={{
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 8, padding: 7, cursor: 'pointer',
                  }}>
                    <Edit3 size={14} color="#818cf8" />
                  </button>
                  <button onClick={() => { if (confirm('Delete task?')) deleteM.mutate(task.id); }} style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: 7, cursor: 'pointer',
                  }}>
                    <Trash2 size={14} color="#f87171" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <TaskModal onClose={() => setShowModal(false)} onSave={(d: any) => createM.mutate(d)} loading={createM.isPending} />}
      {editTask && <TaskModal task={editTask} onClose={() => setEditTask(null)} onSave={(d: any) => updateM.mutate({ id: editTask.id, ...d })} loading={updateM.isPending} />}
    </div>
  );
}
