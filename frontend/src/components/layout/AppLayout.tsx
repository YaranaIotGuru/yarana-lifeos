'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, CheckSquare, Users, BookOpen, Wallet,
  LogOut, Menu, X, Bell, Plus, Zap
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#818cf8' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks', color: '#34d399' },
  { href: '/clients', icon: Users, label: 'Clients', color: '#60a5fa' },
  { href: '/ledger', icon: Wallet, label: 'Ledger', color: '#fbbf24' },
  { href: '/notes', icon: BookOpen, label: 'Notes', color: '#f472b6' },
];

const SIDEBAR_WIDTH = 260;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const currentPage = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090912', position: 'relative' }}>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: `${SIDEBAR_WIDTH}px`,
          background: '#0c0c1a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`) : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              flexShrink: 0,
            }}>
              <Zap size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Yarana</div>
              <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>LifeOS</div>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '12px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 14, fontWeight: 700, color: 'white',
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.mobile}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 12px', marginBottom: 4 }}>
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12,
                  textDecoration: 'none',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 20, background: '#6366f1', borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <item.icon size={18} color={isActive ? item.color : '#6b7280'} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: isActive ? 'white' : '#9ca3af' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 12, width: '100%',
              background: 'none', border: '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s ease',
              color: '#6b7280',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
              (e.currentTarget as HTMLElement).style.color = '#f87171';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#6b7280';
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        minWidth: 0,
      }}>
        {/* Top Bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          height: 60,
          background: 'rgba(9,9,18,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12,
        }}>
          {/* Hamburger - mobile only */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Menu size={20} color="#9ca3af" />
            </button>
          )}

          {/* Page title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
              {currentPage?.label || 'Dashboard'}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Link
              href="/tasks?new=1"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#4f46e5', color: 'white',
                padding: '8px 14px', borderRadius: 10,
                textDecoration: 'none', fontSize: 13, fontWeight: 600,
                boxShadow: '0 2px 12px rgba(79,70,229,0.3)',
                flexShrink: 0,
              }}
            >
              <Plus size={15} />
              <span>Add</span>
            </Link>
            <button style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <Bell size={18} color="#9ca3af" />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, background: '#ef4444',
                borderRadius: '50%', border: '1.5px solid #090912',
              }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflow: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation */}
        {isMobile && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(12,12,26,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-around',
            padding: '8px 4px 12px',
            zIndex: 40,
          }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '6px 12px', borderRadius: 12, textDecoration: 'none',
                    background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                    minWidth: 56,
                  }}
                >
                  <item.icon size={20} color={isActive ? item.color : '#6b7280'} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? 'white' : '#6b7280' }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
