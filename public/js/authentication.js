import { auth, db } from "/js/firebase/Config.js";
import { generateUniqueFriendCode } from "/js/firebase/friendCode.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getCurrentUser } from "/js/firebase/session.js";

getCurrentUser().then((user) => {
  if (user) window.location.replace("/home");
});

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

  if (password !== confirm) {
    return show("signup-error", "Passwords don't match.");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, {
      displayName: username,
    });

    const friendCode = await generateUniqueFriendCode();

    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      avatarId: 0,
      currentStudyMinutes: 0,
      currentStudyStreak: 0,
      totalStudyMinutes: 0,
      longestStudyStreak: 0,
      createdAt: serverTimestamp(),
      friendCode: friendCode, // Generate a unique code separately
      friendIds: [],
    });

    window.location.href = "/home";

  } catch (err) {
    show("signup-error", err.message);
  }
});

// LOG IN
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "/home";

  } catch (err) {
    show("login-error", err.message);
  }
});
