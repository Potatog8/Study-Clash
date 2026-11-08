
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdA56UHCqD_NDuPXPWNQXnia0LEQTV1cw",
  authDomain: "study-clash-hackcamp.firebaseapp.com",
  projectId: "study-clash-hackcamp",
  storageBucket: "study-clash-hackcamp.firebasestorage.app",
  messagingSenderId: "54121925781",
  appId: "1:54121925781:web:969956f4a46f52baaedf9c"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
