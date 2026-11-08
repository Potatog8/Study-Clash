import { auth, db } from "/js/firebase/Config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Resolves with the signed-in user, or null if nobody is signed in.
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// For protected pages: sends visitors to /login if not signed in.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.replace("/login");
    return null;
  }
  return user;
}

// The user's document from the "users" collection (username, friendCode, etc.)
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function logout() {
  await signOut(auth);
  window.location.href = "/login";
}