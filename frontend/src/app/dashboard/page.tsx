'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import {
  CheckSquare, Users, TrendingUp, TrendingDown, Clock,
  ArrowRight, Plus, AlertCircle, CheckCircle2, Circle, BookOpen, Target
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const NotificationSettings = dynamic(() => import('@/components/NotificationSettings'), { ssr: false });

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 12,
};

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor, href }: any) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        ...card,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLElement).style.transform = 'none';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={iconColor} />
          </div>
          <ArrowRight size={14} color="#4b5563" />
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{value}</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      height: 120, borderRadius: 16,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

const priorityColors: any = {
  high: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  medium: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  low: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const today = format(new Date(), 'EEEE, MMMM d');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard') as any,
    refetchInterval: 60000,
  });

  const dashboard = data?.dashboard;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{today}</div>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: 'white', margin: 0 }}>
            {getGreeting()},{' '}
            <span style={{ background: 'linear-gradient(to right, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.name?.split(' ')[0]}!
            </span>
            {' '}👋
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/tasks?new=1" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#4f46e5', color: 'white', padding: '9px 16px',
            borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            boxShadow: '0 2px 12px rgba(79,70,229,0.3)',
          }}>
            <Plus size={15} /> Add Task
          </Link>
          <Link href="/clients?new=1" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', color: 'white', padding: '9px 16px',
            borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <Plus size={15} /> Add Client
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={CheckSquare} label="Today's Pending"
              value={dashboard?.task_stats?.today_pending ?? 0}
              sub={`${dashboard?.task_stats?.today_completed ?? 0} done today`}
              iconBg="rgba(99,102,241,0.2)" iconColor="#818cf8"
              href="/tasks"
            />
            <StatCard
              icon={Users} label="Active Clients"
              value={dashboard?.client_stats?.active ?? 0}
              sub={`₹${Number(dashboard?.client_stats?.pending_amount ?? 0).toLocaleString('en-IN')} due`}
              iconBg="rgba(59,130,246,0.2)" iconColor="#60a5fa"
              href="/clients"
            />
            <StatCard
              icon={TrendingUp} label="Total Lena"
              value={`₹${Number(dashboard?.ledger_summary?.total_lena ?? 0).toLocaleString('en-IN')}`}
              sub="Amount to receive"
              iconBg="rgba(16,185,129,0.2)" iconColor="#34d399"
              href="/ledger"
            />
            <StatCard
              icon={TrendingDown} label="Total Dena"
              value={`₹${Number(dashboard?.ledger_summary?.total_dena ?? 0).toLocaleString('en-IN')}`}
              sub="Amount to pay"
              iconBg="rgba(239,68,68,0.2)" iconColor="#f87171"
              href="/ledger"
            />
          </>
        )}
      </div>

      {/* Notification Settings */}
      <NotificationSettings />

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Today's Tasks */}
        <div style={{ ...card, gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={sectionTitle}>
              <CheckSquare size={16} color="#818cf8" />Today's Tasks
            </div>
            <Link href="/tasks" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#818cf8', textDecoration: 'none' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 56, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          ) : !dashboard?.today_tasks?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Target size={36} color="#374151" style={{ margin: '0 auto 8px' }} />
              <div style={{ color: '#6b7280', fontSize: 13 }}>No tasks for today</div>
              <Link href="/tasks?new=1" style={{ color: '#818cf8', fontSize: 12, textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>
                + Add task
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dashboard.today_tasks.map((task: any) => {
                const pc = priorityColors[task.priority] || priorityColors.medium;
                return (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12,
                    background: task.status === 'completed' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    opacity: task.status === 'completed' ? 0.6 : 1,
                  }}>
                    {task.status === 'completed'
                      ? <CheckCircle2 size={17} color="#34d399" style={{ flexShrink: 0 }} />
                      : <Circle size={17} color="#4b5563" style={{ flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: task.status === 'completed' ? '#6b7280' : 'white',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {task.title}
                      </div>
                      {task.reminder_time && (
                        <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <Clock size={10} />{format(new Date(task.reminder_time), 'h:mm a')}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                      background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`,
                      flexShrink: 0, textTransform: 'capitalize',
                    }}>
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Clients + Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Pending Clients */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={sectionTitle}><Users size={16} color="#60a5fa" />Pending Clients</div>
              <Link href="/clients" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            {isLoading ? <div style={{ height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
              : !dashboard?.pending_clients?.length
                ? <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: '#6b7280' }}>No pending clients 🎉</div>
                : dashboard.pending_clients.slice(0, 4).map((c: any) => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(59,130,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#60a5fa', flexShrink: 0,
                    }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.work_description || 'No description'}</div>
                    </div>
                    {c.payment_status === 'unpaid' && <AlertCircle size={14} color="#fbbf24" />}
                  </div>
                ))}
          </div>

          {/* Recent Notes */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={sectionTitle}><BookOpen size={16} color="#f472b6" />Recent Notes</div>
              <Link href="/notes" style={{ fontSize: 12, color: '#f472b6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                All <ArrowRight size={11} />
              </Link>
            </div>
            {isLoading ? <div style={{ height: 60, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
              : !dashboard?.recent_notes?.length
                ? <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: '#6b7280' }}>No notes yet</div>
                : dashboard.recent_notes.map((note: any) => (
                  <Link key={note.id} href={`/notes`} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none',
                  }}>
                    <div style={{ width: 4, height: 32, borderRadius: 4, background: note.color || '#6366f1', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.is_locked ? '🔒 Locked Note' : note.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>
                        {note.category?.replace('_', ' ')}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
