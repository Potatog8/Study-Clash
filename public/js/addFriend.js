import { db } from "/js/firebase/Config.js";
import { requireUser } from "/js/firebase/session.js";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const dialog = document.getElementById("friend-dialog");
const openButton = document.getElementById("add-friend-btn");
const closeButton = document.getElementById("friend-close");
const form = document.getElementById("friend-form");
const input = document.getElementById("friend-code");
const errorMessage = document.getElementById("friend-error");
const submitButton = form.querySelector(".friend-submit");

const CODE_LENGTH = 5;
const CODE_PATTERN = /^[A-Z0-9]{5}$/; // exactly 5 capital letters or numbers
const CODE_PREFIX = "SC-";            // stored codes look like "SC-YL5RZ"

/* ---------- Open / close ---------- */
openButton.addEventListener("click", () => {
  form.reset();
  showMessage("");
  submitButton.disabled = false;
  dialog.showModal(); // centered, with the blurred backdrop. Esc closes it too
});

closeButton.addEventListener("click", () => dialog.close());

// Clicking the blurred area outside the popup closes it
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

function showMessage(text, isSuccess = false) {
  errorMessage.textContent = text;
  errorMessage.classList.toggle("is-success", isSuccess);
}

/* ---------- Keep the code clean as they type ---------- */
// Capitals only, letters and numbers only, max 5 characters
input.addEventListener("input", () => {
  input.value = input.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
  showMessage("");
});

/* ---------- Add the friend ---------- */
// Finds the user with this friend code and adds their uid to YOUR friendIds.
// Returns the friend's username. Throws an Error with a readable message on failure.
async function addFriend(code) {
  const user = await requireUser();
  if (!user) throw new Error("You must be logged in.");

  // Ask Firestore for the one user whose friendCode matches (no looping through users)
  const lookup = query(
    collection(db, "users"),
    where("friendCode", "==", CODE_PREFIX + code),
    limit(1)
  );
  const result = await getDocs(lookup);
  if (result.empty) throw new Error("No user found with that friend code.");

  const friendDoc = result.docs[0];
  const friendUid = friendDoc.id;

  if (friendUid === user.uid) throw new Error("That's your own friend code!");

  // Already friends?
  const myRef = doc(db, "users", user.uid);
  const mySnap = await getDoc(myRef);
  const myFriendIds = mySnap.data()?.friendIds ?? [];
  if (myFriendIds.includes(friendUid)) throw new Error("You're already friends with them.");

  // arrayUnion adds the uid to the friendIds array (and never creates duplicates)
  await updateDoc(myRef, { friendIds: arrayUnion(friendUid) });

  return friendDoc.data().username ?? "your friend";
}

/* ---------- Submit ---------- */
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  const code = input.value.trim().toUpperCase();

  if (!CODE_PATTERN.test(code)) {
    showMessage("A friend code is exactly 5 letters or numbers.");
    return;
  }

  submitButton.disabled = true;

  try {
    const friendName = await addFriend(code);
    showMessage(`Added ${friendName}!`, true);
    setTimeout(() => dialog.close(), 1200);
  } catch (error) {
    console.error(error);
    if (error.code === "permission-denied") {
      showMessage("Firestore blocked that lookup. Check your security rules.");
    } else if (error.code) {
      showMessage("Something went wrong. Please try again.");
    } else {
      showMessage(error.message); // our own readable messages from addFriend()
    }
    submitButton.disabled = false;
  }
});
