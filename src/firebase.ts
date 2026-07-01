import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Injected Firebase config
const firebaseConfig = {
  projectId: "gen-lang-client-0599517246",
  appId: "1:389543589028:web:fff896b5a3f42ccf8fa231",
  apiKey: "AIzaSyCYIfOsNpT26-3m9K2fzCbV5sXZsG3Mfg8",
  authDomain: "gen-lang-client-0599517246.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-knim15nmratrng20-4afe7e38-c379-43a7-b009-4278328a3ebd",
  storageBucket: "gen-lang-client-0599517246.firebasestorage.app",
  messagingSenderId: "389543589028",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
