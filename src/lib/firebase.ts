import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyD3QPdDoWT3Fw7XDyDUWKI59gcC2nsjcao",
  authDomain: "digigate-330c0.firebaseapp.com",
  projectId: "digigate-330c0",
  storageBucket: "digigate-330c0.firebasestorage.app",
  messagingSenderId: "183160263199",
  appId: "1:183160263199:web:b7901ab625e1404f50bb2a",
  measurementId: "G-ZYDB0CQS02"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, 'wyndham-risk-db');
