import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/VERSION/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/VERSION/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/VERSION/firebase-firestore.js";

const res = await fetch("/api/firebase-config");
if (!res.ok) throw new Error("Could not load Firebase config from the server.");
const firebaseConfig = await res.json();

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  throw new Error(`Missing Firebase values in .env: ${missing.join(", ")}. Restart the server after editing .env.`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);