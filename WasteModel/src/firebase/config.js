import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpYKKuJrs5duM1tbRKyUy2oXNhSS-0I9E",
  authDomain: "find-my-bin-8f89d.firebaseapp.com",
  projectId: "find-my-bin-8f89d",
  storageBucket: "find-my-bin-8f89d.firebasestorage.app",
  messagingSenderId: "1044320837058",
  appId: "1:1044320837058:web:2e4db4d00750122093ca5b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;
