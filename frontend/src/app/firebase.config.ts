
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBAz0RhD_bnwNzH9z8npeOpXPOqJXDNjb8',
  authDomain: 'penny-budget-tracking.firebaseapp.com',
  projectId: 'penny-budget-tracking',
  storageBucket: 'penny-budget-tracking.firebasestorage.app',
  messagingSenderId: '667521187765',
  appId: '1:667521187765:web:b5650660e7619fa64d63fc',
  measurementId: 'G-89KHD7NSZ9'
};

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);
