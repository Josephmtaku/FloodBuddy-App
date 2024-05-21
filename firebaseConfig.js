import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBcUsSFMnS04JB-0xYOmf-EPlMwXpO354U",
  authDomain: "floodbuddy-3e3f6.firebaseapp.com",
  projectId: "floodbuddy-3e3f6",
  storageBucket: "floodbuddy-3e3f6.appspot.com",
  messagingSenderId: "654767866353",
  appId: "1:654767866353:web:d960c291325aa48d540450",
  measurementId: "G-DD1QMSQ3ZV"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);