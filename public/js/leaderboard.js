import { requireUser, getUserData, logout } from "/js/firebase/session.js";

async function init() {
  const user = await requireUser();
  if (!user) return; // not signed in, already redirecting to /login

  // Show something immediately from the Auth profile (no network request)
  const nameEl = document.getElementById("header-username");
  nameEl.textContent = user.displayName ?? "";

  // Then load the full Firestore document for the authoritative data
  const data = await getUserData(user.uid);
  if (data) {
    nameEl.textContent = data.username;

    const heading = document.getElementById("welcome-heading");
    if (heading) heading.textContent = `Welcome back, ${data.username}!`;
  }

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}

init();