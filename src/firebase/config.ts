
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration - in production, use environment variables
const firebaseConfig = {
  apiKey: "AIzaSyA-example-key-replace-this",
  authDomain: "typing-app.firebaseapp.com",
  projectId: "typing-app",
  storageBucket: "typing-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistent auth state (survives page refreshes)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Authentication persistence error:", error);
});

// Connect to emulators in development for local testing (if needed)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db };
