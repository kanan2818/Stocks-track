/**
 * firebase.js — Phase 10 & 11
 * Firebase is now active: Firestore (database) + Auth (admin login).
 */

import { initializeApp }                         from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth }                               from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyBYA9cUI4qGO5OXWfjyYWJUqcnsy9yH00g",
  authDomain:        "stocks-panels.firebaseapp.com",
  projectId:         "stocks-panels",
  storageBucket:     "stocks-panels.firebasestorage.app",
  messagingSenderId: "952168881927",
  appId:             "1:952168881927:web:e2e10afea3763fe0782fa2",
  measurementId:     "G-K9TRK4T16M",
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// Offline persistence — app keeps working when connection drops, then auto-syncs
enableIndexedDbPersistence(db).catch(err => {
  if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
    console.warn('Firestore offline persistence unavailable:', err);
  }
});

export const FIREBASE_ENABLED = true;
