import { db } from "/js/firebase/config.js";
import { requireUser, getUserData, logout } from "/js/firebase/session.js";
import {
  doc,
  collection,
  runTransaction,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const MIN_SESSION_MINUTES = 1; // sessions shorter than this aren't saved (set to 0 while testing)

// ---------- Points ----------
function calculatePoints(minutes, streak) {
  const multiplier = Math.min(2, streak * 0.2 + 1);
  return Math.round(minutes * multiplier);
}

// ---------- Messages ----------
const MESSAGES = {
  short:  ["You can do better!", "You're getting there!"],
  medium: ["Solid work!", "Nice focus, keep it up!"],
  great:  ["Great job!", "Amazing work!", "Wow, that's some serious focus!"],
  epic:   ["Absolutely astonishing!", "Incredible! You're unstoppable!", "Legendary focus!"],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getMessage(minutes) {
  if (minutes < 10) return pick(MESSAGES.short);
  if (minutes < 30) return pick(MESSAGES.medium);
  if (minutes < 60) return pick(MESSAGES.great);
  return pick(MESSAGES.epic);
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts = [];
  if (h) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
  if (m || !h) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
  return parts.join(" and ");
}

// Local calendar date as "YYYY-MM-DD"
function dateKey(date) {
  return date.toLocaleDateString("en-CA");
}

// ---------- Elements ----------
const timerEl = document.getElementById("timer");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const stopBtn = document.getElementById("stop-btn");
const timerCard = document.querySelector(".timer-card");
const resultsCard = document.getElementById("results-card");

// ---------- Timer state ----------
let elapsedMs = 0;     // time banked from earlier run segments
let startedAt = null;  // start of the current run segment, null while paused/stopped
let intervalId = null;
let sessionActive = false;
let saving = false;

function currentElapsed() {
  return elapsedMs + (startedAt ? Date.now() - startedAt : 0);
}

function render() {
  const total = Math.floor(currentElapsed() / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  timerEl.textContent = `${h}:${m}:${s}`;
}

function runSegment() {
  startedAt = Date.now();
  intervalId = setInterval(render, 250);
  pauseBtn.textContent = "Pause";
  statusEl.textContent = "Studying...";
}

function freeze() {
  if (startedAt) {
    elapsedMs += Date.now() - startedAt;
    startedAt = null;
  }
  clearInterval(intervalId);
  render();
}

function startSession() {
  if (sessionActive) return;
  sessionActive = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  runSegment();
}

function togglePause() {
  if (!sessionActive) return;
  if (startedAt) {
    freeze();
    pauseBtn.textContent = "Resume";
    statusEl.textContent = "Paused";
  } else {
    runSegment();
  }
}

function resetTimer() {
  freeze();
  elapsedMs = 0;
  sessionActive = false;
  render();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  statusEl.textContent = "Ready to study";
}

// ---------- Saving ----------
async function saveSession(user, minutes) {
  const userRef = doc(db, "users", user.uid);
  const sessionRef = doc(collection(db, "users", user.uid, "studySessions")); // unique ID

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    const u = snap.data();

    // Streak = consecutive days with at least one session
    const today = dateKey(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = dateKey(yesterdayDate);

    let streak = u.currentStudyStreak ?? 0;
    if (u.lastStudyDate === today) streak = Math.max(streak, 1);
    else if (u.lastStudyDate === yesterday) streak += 1;
    else streak = 1;

    const points = calculatePoints(minutes, streak);
    const previousTotal = u.totalPoints ?? 0;
    const totalPoints = previousTotal + points;

    tx.set(sessionRef, {
      elapsedTimeMinutes: minutes,
      date: serverTimestamp(),
      score: points,
      streak,
    });

    tx.update(userRef, {
      totalPoints,
      totalStudyMinutes: increment(minutes),
      currentStudyStreak: streak,
      longestStudyStreak: Math.max(u.longestStudyStreak ?? 0, streak),
      lastStudyDate: today,
    });

    return { points, streak, previousTotal, totalPoints };
  });
}

// ---------- Results reveal ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
const reveal = (el) => el.classList.add("is-visible");

function countUp(el, from, to, duration) {
  return new Promise((resolve) => {
    if (reduceMotion || from === to) {
      el.textContent = to;
      return resolve();
    }
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      el.textContent = Math.round(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

async function playResults(minutes, { points, streak, previousTotal, totalPoints }) {
  const pointsEl = document.getElementById("result-points");
  const totalEl = document.getElementById("result-total");

  // Fill in text and reset everything to the hidden starting state
  document.getElementById("result-message").textContent = getMessage(minutes);
  document.getElementById("result-time").textContent = `You studied for ${formatDuration(minutes)}!`;
  document.getElementById("result-streak").textContent = streak;
  pointsEl.textContent = "0";
  totalEl.textContent = previousTotal;
  
  resultsCard.querySelectorAll(".reveal").forEach((el) => el.classList.remove("is-visible"));

  timerCard.hidden = true;
  resultsCard.hidden = false;

  await sleep(400);
  reveal(document.getElementById("result-message"));

  await sleep(1400);
  reveal(document.getElementById("result-time"));

  await sleep(1400);
  reveal(document.getElementById("result-points-line"));
  await sleep(500);
  await countUp(pointsEl, 0, points, 1600);

  await sleep(1000);
  reveal(document.getElementById("result-total-line"));
  await sleep(900);
  await countUp(totalEl, previousTotal, totalPoints, 2400);

  await sleep(700);
  reveal(document.getElementById("result-actions"));
}

// ---------- Init ----------
async function init() {
  const user = await requireUser();
  if (!user) return; // already redirecting to /login

  document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });

  pauseBtn.disabled = true;
  stopBtn.disabled = true;

  startBtn.addEventListener("click", startSession);
  pauseBtn.addEventListener("click", togglePause);

  stopBtn.addEventListener("click", async () => {
    if (!sessionActive || saving) return;

    freeze(); // stop the clock while we save
    const minutes = Math.floor(elapsedMs / 60000);

    if (minutes < MIN_SESSION_MINUTES) {
      resetTimer();
      statusEl.textContent = "Sessions under a minute don't count. Ready to study";
      return;
    }

    saving = true;
    stopBtn.disabled = true;
    pauseBtn.disabled = true;
    statusEl.textContent = "Saving your session...";

    try {
      const result = await saveSession(user, minutes);
      await playResults(minutes, result);
    } catch (err) {
      console.error("Failed to save session:", err);
      // Timer stays frozen at its current time, so pressing End Session again retries
      pauseBtn.textContent = "Resume";
      statusEl.textContent = "Couldn't save your session. Press End Session to try again.";
      stopBtn.disabled = false;
      pauseBtn.disabled = false;
    } finally {
      saving = false;
    }
  });

  document.getElementById("keep-studying-btn").addEventListener("click", () => {
    resultsCard.hidden = true;
    timerCard.hidden = false;
    resetTimer();
  });
}

init();