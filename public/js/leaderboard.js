const list = document.getElementById("leaderboard-list");

const EMPTY = "---";

const FLAME_SVG = `
  <svg class="lb-flame" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>`;

/* ---------- Helpers ---------- */

// Builds an element and sets its text safely (textContent, never innerHTML,
// so usernames can't inject HTML)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// 750 -> "12h 30m", 45 -> "45m", missing -> "---"
function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined) return EMPTY;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${String(mins).padStart(2, "0")}m` : `${mins}m`;
}

function formatStreak(streak) {
  if (streak === null || streak === undefined) return EMPTY;
  return `${streak} day streak`;
}

/* ---------- Row pieces ---------- */

function createEmptyAvatar(username) {
  const first = (username || "").charAt(0);
  const initial = /[\p{L}\p{N}]/u.test(first) ? first.toUpperCase() : "?";
  return el("span", "lb-avatar lb-avatar-empty", initial);
}

function createAvatar(player) {
  if (!player.avatarUrl) return createEmptyAvatar(player.username);

  const img = el("img", "lb-avatar");
  img.src = player.avatarUrl;
  img.alt = "";
  img.loading = "lazy";
  // If the picture fails to load, fall back to the letter circle
  img.addEventListener("error", () => img.replaceWith(createEmptyAvatar(player.username)));
  return img;
}

function createRow(player, index) {
  const row = el("li", "lb-row");
  if (index === 0) row.classList.add("lb-top");

  // Rank
  row.append(el("span", "lb-rank", String(index + 1)));

  // Avatar
  row.append(createAvatar(player));

  // Username + current streak
  const info = el("div", "lb-info");
  info.append(el("span", "lb-name", player.username || EMPTY));

  const streak = el("span", "lb-streak");
  streak.insertAdjacentHTML("afterbegin", FLAME_SVG);
  streak.append(el("span", "", formatStreak(player.streak)));
  info.append(streak);
  row.append(info);

  // Time studied this week
  const time = el("div", "lb-time");
  time.append(el("span", "lb-time-value", formatMinutes(player.weeklyMinutes)));
  time.append(el("span", "lb-time-label", "This week"));
  row.append(time);

  return row;
}

/* ---------- Render ---------- */

// players should already be ranked, highest weekly time first.
// Each player: { username, avatarUrl, weeklyMinutes, streak }
export function renderLeaderboard(players) {
  list.replaceChildren(...players.map(createRow));
}

/* ---------- Placeholder data until Firestore is hooked up ---------- */

const placeholderPlayers = Array.from({ length: 5 }, () => ({
  username: EMPTY,
  avatarUrl: "",
  weeklyMinutes: null,
  streak: null,
}));

renderLeaderboard(placeholderPlayers);

/* ---------- TODO: load the real data from Firestore ----------
   Swap the placeholder call above for something like this. The field names
   (username, avatarUrl, weeklyMinutes, streak) are guesses, so rename them
   to match your documents.

   import { collection, getDocs, query, orderBy, limit }
     from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
   import { db } from "./firebaseConfig.js";

   const q = query(collection(db, "users"), orderBy("weeklyMinutes", "desc"), limit(20));
   const snapshot = await getDocs(q);
   renderLeaderboard(snapshot.docs.map((doc) => doc.data()));
*/
