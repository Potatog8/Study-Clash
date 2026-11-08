
import { auth, db } from "/js/firebase/config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


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

});
