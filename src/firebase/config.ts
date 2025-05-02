
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your Firebase config
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

export { app, auth, db };
