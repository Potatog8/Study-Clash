
// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdA56UHCqD_NDuPXPWNQXnia0LEQTV1cw",
  authDomain: "study-clash-hackcamp.firebaseapp.com",
  projectId: "study-clash-hackcamp",
  storageBucket: "study-clash-hackcamp.firebasestorage.app",
  messagingSenderId: "54121925781",
  appId: "1:54121925781:web:969956f4a46f52baaedf9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export services
export { app, auth, db };
