'use client';
import { useEffect, useRef } from 'react';
import { app, getMessaging, getToken, onMessage, isSupported, VAPID_KEY } from '@/lib/firebase';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useNotifications() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Only run client-side
    if (typeof window === 'undefined') return;

    // Check token in localStorage to avoid re-requesting every refresh
    const savedToken = localStorage.getItem('fcm_token');

    const initFCM = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.log('FCM not supported in this browser');
          return;
        }

        const messaging = getMessaging(app);

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
        }

        // Register service worker first
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!token) {
          console.log('No FCM token received');
          return;
        }

        // Save to server only if token changed
        if (token !== savedToken) {
          await api.post('/notifications/token', { token });
          localStorage.setItem('fcm_token', token);
          console.log('FCM token saved:', token.slice(0, 20) + '...');
        }

        // Foreground message handler (app is open)
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          // Show toast notification when app is open
          toast(
            () => (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22 }}>⏰</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'white', marginBottom: 3 }}>
                    {title || 'Yarana Reminder'}
                  </div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>{body}</div>
                </div>
              </div>
            ) as any,
            {
              duration: 8000,
              style: {
                background: '#1a1a2e',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 14,
                color: 'white',
                padding: '14px 16px',
              },
              icon: '🔔',
            }
          );
        });

      } catch (err) {
        console.error('FCM init error:', err);
      }
    };

    // Only init if user is logged in
    const token = localStorage.getItem('yarana_token');
    if (token) initFCM();

  }, []);
}
