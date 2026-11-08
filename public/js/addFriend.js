const dialog = document.getElementById("friend-dialog");
const openButton = document.getElementById("add-friend-btn");
const closeButton = document.getElementById("friend-close");
const form = document.getElementById("friend-form");
const input = document.getElementById("friend-code");
const errorMessage = document.getElementById("friend-error");

const CODE_LENGTH = 5;
const CODE_PATTERN = /^[A-Z0-9]{5}$/; // exactly 5 capital letters or numbers

/* ---------- Open / close ---------- */
openButton.addEventListener("click", () => {
  form.reset();
  errorMessage.textContent = "";
  dialog.showModal(); // centered, with the blurred backdrop. Esc closes it too
});

closeButton.addEventListener("click", () => dialog.close());

// Clicking the blurred area outside the popup closes it
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

/* ---------- Keep the code clean as they type ---------- */
// Capitals only, letters and numbers only, max 5 characters
input.addEventListener("input", () => {
  input.value = input.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
  errorMessage.textContent = "";
});

/* ---------- Submit ---------- */
async function addFriend(code) {
  // TODO: look up the user with this friend code in Firestore and create
  // the friend request here. Throw an Error with a readable message if
  // something goes wrong (e.g. "No user with that friend code") and it
  // will show in the popup.
  console.log("Add friend with code:", code);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  const code = input.value.trim().toUpperCase();

  if (!CODE_PATTERN.test(code)) {
    errorMessage.textContent = "A friend code is exactly 5 letters or numbers.";
    return;
  }

  try {
    await addFriend(code);
    dialog.close();
  } catch (error) {
    errorMessage.textContent = error.message || "Couldn't send the request. Please try again.";
  }
});
