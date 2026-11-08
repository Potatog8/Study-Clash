import { db } from "/js/firebase/Config.js";
import { requireUser, getUserData, logout } from "/js/firebase/session.js";
import {
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

async function init() {
  const user = await requireUser();
  if (!user) return;                       // already redirecting

  const data = await getUserData(user.uid);
  console.log("Logged in as", data.username, data.friendCode);

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  // Example: when the timer stops, save the minutes to this user's document
  document.getElementById("stop-btn").addEventListener("click", async () => {
    const minutes = 25; // replace with your real elapsed minutes
    await updateDoc(doc(db, "users", user.uid), {
      totalStudyMinutes: increment(minutes),
      currentStudyMinutes: increment(minutes),
    });
  });
}

init();