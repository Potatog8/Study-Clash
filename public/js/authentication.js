
import { auth, db } from "/js/firebase/Config.js";
import { generateUniqueFriendCode } from "/js/firebase/friendCode.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Display error messages
const show = (id, msg) => {
  document.getElementById(id).textContent = msg;
};

// SIGN UP
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  // Check if passwords match
  if (password !== confirm) {
    return show("signup-error", "Passwords don't match.");
  }

  try {
    // Create Firebase Authentication account
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Set user's display name
    await updateProfile(cred.user, {
      displayName: username,
    });

    // Generate a unique friend code
    const friendCode = await generateUniqueFriendCode();

    // Create Firestore user document
    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      avatarId: 0,
      currentStudyMinutes: 0,
      currentStudyStreak: 0,
      totalStudyMinutes: 0,
      longestStudyStreak: 0,
      createdAt: serverTimestamp(),
      friendCode,
      friendIds: [],
    });

    // Redirect after successful signup
    window.location.href = "/home.html";

  } catch (err) {
    console.error("Signup error:", err);
    show("signup-error", err.message);
  }
});

// LOG IN
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    // Sign in with Firebase Authentication
    await signInWithEmailAndPassword(auth, email, password);

    // Redirect after successful login
    window.location.href = "/home.html";

  } catch (err) {
    console.error("Login error:", err);
    show("login-error", err.message);
  }
});
