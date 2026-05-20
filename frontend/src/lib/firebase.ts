import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyCSqd8h4ckfsxg0tAp-3wKKkeCnwENEFLE',
  authDomain: 'yarana-lifeos.firebaseapp.com',
  projectId: 'yarana-lifeos',
  storageBucket: 'yarana-lifeos.firebasestorage.app',
  messagingSenderId: '190570205366',
  appId: '1:190570205366:web:9e22d4aa16646d106b5617',
  measurementId: 'G-FYDRJZKTP5',
};

// Prevent duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const VAPID_KEY = 'BC463MZKXEGxhSxiX8NdA-Os_fRBicK6Svc0VOLzTyd-h6U40IJVx_tQsQIja66IbTYYFAgm69MpgbpzkGn_AaY';

export { app, getMessaging, getToken, onMessage, isSupported };
