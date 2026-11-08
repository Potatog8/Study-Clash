import { db } from "/js/firebase/Config.js";
import { requireUser } from "/js/firebase/session.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const codeElement = document.getElementById("profile-friend-code");

async function showFriendCode() {
  const user = await requireUser();
  if (!user) return; // already redirecting to /login

  const snapshot = await getDoc(doc(db, "users", user.uid));
  codeElement.textContent = snapshot.data()?.friendCode ?? "---";
}

showFriendCode().catch((error) => console.error("Couldn't load friend code:", error));
