import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const show = (id, msg) => (document.getElementById(id).textContent = msg);

// SIGN UP
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (password !== confirm) return show("signup-error", "Passwords don't match.");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      createdAt: serverTimestamp(),
    });
    window.location.href = "home.html"; // your page after login
  } catch (err) {
    show("signup-error", err.code); // e.g. auth/email-already-in-use
  }
});

// LOG IN
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "home.html";
  } catch (err) {
    show("login-error", err.code); // e.g. auth/invalid-credential
  }
});