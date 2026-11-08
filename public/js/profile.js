
import { auth, db } from "/js/firebase/config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,   // NEW
  query,        // NEW
  orderBy,      // NEW
  limit,        // NEW
  startAfter,   // NEW
  getDocs       // NEW
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ---------- NEW: recent study sessions ----------

const PAGE_SIZE = 5;
const GREEN_AT_MINUTES = 30; // sessions this long (or longer) are fully green

const sessionsList = document.getElementById("sessions-list");
const viewMoreBtn = document.getElementById("view-more-btn");

let currentUser = null;
let lastShownDoc = null; // cursor for the next page
let loading = false;
let firstRender = true;

// Turn minutes into text like "45 min" or "1 hr 5 min"
function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

// 0 min = red, 15 min = yellow, 30+ min = green
function coloursForMinutes(minutes) {
  const t = Math.min(Math.max(minutes, 0), GREEN_AT_MINUTES) / GREEN_AT_MINUTES;
  const hue = Math.round(t * 120); // hue 0 is red, 120 is green
  return {
    background: `hsl(${hue}, 75%, 85%)`,
    border: `hsl(${hue}, 65%, 42%)`,
  };
}

// Build one labelled stat (Date, Studied, Points, Streak)
function makeStat(label, value, sub) {
  const wrap = document.createElement("div");
  wrap.className = "session-stat";

  const labelEl = document.createElement("span");
  labelEl.className = "session-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "session-value";
  valueEl.textContent = value;

  wrap.append(labelEl, valueEl);

  if (sub) {
    const subEl = document.createElement("span");
    subEl.className = "session-sub";
    subEl.textContent = sub;
    wrap.append(subEl);
  }
  return wrap;
}

// Build one colour-coded session cell
function renderSession(docSnap) {
  const s = docSnap.data();
  const minutes = s.elapsedTimeMinutes ?? 0;
  const date = s.date?.toDate();
  const colours = coloursForMinutes(minutes);

  const dateText = date
    ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Unknown date";
  const timeText = date
    ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "";

  // Sessions saved before the streak field existed show a dash
  const streakText =
    s.streak != null ? `${s.streak} day${s.streak === 1 ? "" : "s"}` : "—";

  const card = document.createElement("div");
  card.className = "session-card";
  card.style.backgroundColor = colours.background;
  card.style.borderLeft = `8px solid ${colours.border}`;

  card.append(
    makeStat("Date", dateText, timeText),
    makeStat("Studied", formatDuration(minutes)),
    makeStat("Points", `${s.score ?? 0} pts`),
    makeStat("Streak", streakText)
  );

  return card;
}

// Load the next 5 sessions (called on page load and by the "view more" button)
async function loadSessions() {
  if (loading) return;
  loading = true;
  viewMoreBtn.disabled = true;
  viewMoreBtn.textContent = "Loading...";

  try {
    const constraints = [orderBy("date", "desc")];
    if (lastShownDoc) constraints.push(startAfter(lastShownDoc));
    constraints.push(limit(PAGE_SIZE + 1)); // fetch one extra to know if more exist

    const snapshot = await getDocs(
      query(collection(db, "users", currentUser.uid, "studySessions"), ...constraints)
    );

    const hasMore = snapshot.docs.length > PAGE_SIZE;
    const pageDocs = snapshot.docs.slice(0, PAGE_SIZE);

    if (pageDocs.length > 0) {
      if (firstRender) {
        sessionsList.innerHTML = ""; // remove the "No study sessions yet." placeholder
        firstRender = false;
      }
      pageDocs.forEach((d) => sessionsList.appendChild(renderSession(d)));
      lastShownDoc = pageDocs[pageDocs.length - 1];
    }

    viewMoreBtn.hidden = !hasMore;
  } catch (error) {
    console.error("Error loading study sessions:", error);
  } finally {
    loading = false;
    viewMoreBtn.disabled = false;
    viewMoreBtn.textContent = "View more previous study sessions";
  }
}

// Attach the button listener once
viewMoreBtn.addEventListener("click", loadSessions);

// ---------- END NEW ----------


// Check if a user is logged in
onAuthStateChanged(auth, async (user) => {

  // Redirect to login if nobody is logged in
  if (!user) {
    window.location.href = "/login";
    return;
  }

  try {

    // Get the user's document from Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Check if the document exists
    if (!userSnap.exists()) {
      console.log("User document not found.");
      return;
    }

    // Get the user's saved information
    const userData = userSnap.data();


    // DISPLAY USERNAME
    document.getElementById("username").textContent =
      userData.username || "Unknown User";


    // DISPLAY TOTAL STUDY HOURS
    const totalMinutes = userData.totalStudyMinutes || 0;

    // Convert minutes into hours
    const totalHours = totalMinutes / 60;

    document.getElementById("total-hours").textContent =
      totalHours.toFixed(0);


    // DISPLAY CURRENT STUDY STREAK
    document.getElementById("study-streak").textContent =
      userData.currentStudyStreak || 0;

    document.getElementById("longest-streak").textContent =
      userData.longestStudyStreak || 0;


  } catch (error) {
    console.error("Error loading profile:", error);
  }


  // NEW: load the user's 5 most recent study sessions
  currentUser = user;
  loadSessions();

});