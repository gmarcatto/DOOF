import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAAaX8U27m6aUySW_WRraNE3--_r8dW0XA",
  authDomain: "doof-858bd.firebaseapp.com",
  projectId: "doof-858bd",
  storageBucket: "doof-858bd.firebasestorage.app",
  messagingSenderId: "69109625438",
  appId: "1:69109625438:web:b7b1bf53fef4fdef26facf",
  measurementId: "G-VNPGCS71DV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export { app, analytics };
export default app;

