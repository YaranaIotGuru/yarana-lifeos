'use client';
import { useState } from 'react';
import { Bell, BellOff, CheckCircle, Send, Loader } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [sending, setSending] = useState(false);

  const checkPermission = () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  };

  const requestPermission = async () => {
    setStatus('requesting');
    try {
      const { app, getMessaging, getToken, isSupported, VAPID_KEY } = await import('@/lib/firebase');
      const supported = await isSupported();
      if (!supported) { toast.error('Aapka browser notifications support nahi karta'); setStatus('denied'); return; }

      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast.error('Notification permission denied!'); setStatus('denied'); return; }

      const messaging = getMessaging(app);
      const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });

      if (token) {
        await api.post('/notifications/token', { token });
        localStorage.setItem('fcm_token', token);
        setStatus('granted');
        toast.success('Notifications enable ho gayi! 🔔');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Kuch error aaya');
      setStatus('idle');
    }
  };

  const sendTest = async () => {
    setSending(true);
    try {
      await api.post('/notifications/test', {});
      toast.success('Test notification bhej di! 📲 Check karo phone/browser');
    } catch (e: any) {
      toast.error(e?.message || 'Test notification fail ho gayi');
    }
    setSending(false);
  };

  const permission = typeof window !== 'undefined' ? checkPermission() : 'default';
  const isGranted = permission === 'granted' || status === 'granted';

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: isGranted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isGranted ? <Bell size={18} color="#34d399" /> : <BellOff size={18} color="#fbbf24" />}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Push Notifications</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Task reminders ka notification milega</div>
        </div>
        {isGranted && (
          <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600, border: '1px solid rgba(16,185,129,0.25)' }}>
            ✅ Active
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {!isGranted ? (
          <button onClick={requestPermission} disabled={status === 'requesting' || permission === 'denied'} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: permission === 'denied' ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#f59e0b,#f97316)', color: permission === 'denied' ? '#6b7280' : 'white', fontSize: 13, fontWeight: 600, cursor: permission === 'denied' ? 'not-allowed' : 'pointer', flex: 1 }}>
            {status === 'requesting' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Bell size={14} />}
            {permission === 'denied' ? 'Browser se manually allow karo' : status === 'requesting' ? 'Allow kar rahe...' : '🔔 Notifications Enable Karo'}
          </button>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: 13, fontWeight: 500 }}>
              <CheckCircle size={14} /> Enabled
            </div>
            <button onClick={sendTest} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: '#4f46e5', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1, opacity: sending ? 0.7 : 1 }}>
              {sending ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              {sending ? 'Bhej rahe...' : 'Test Notification Bhejo'}
            </button>
          </>
        )}
      </div>

      {permission === 'denied' && (
        <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#f87171' }}>
          ⚠️ Browser settings mein manually notifications allow karo: <br />
          <strong>Address bar → 🔒 Lock icon → Notifications → Allow</strong>
        </div>
      )}
    </div>
  );
}
