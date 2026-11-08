
import { db } from "./Config.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Characters that won't easily be confused
const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Generate a random code
function generateCode() {
  let code = "SC-";

  const randomValues = new Uint8Array(5);
  crypto.getRandomValues(randomValues);

  for (const value of randomValues) {
    code += characters[value % characters.length];
  }

  return code;
}

// Generate a unique friend code
export async function generateUniqueFriendCode() {
  let code;
  let exists = true;

  while (exists) {
    code = generateCode();

    const q = query(
      collection(db, "users"),
      where("friendCode", "==", code)
    );

    const snapshot = await getDocs(q);

    exists = !snapshot.empty;
  }

  return code;
}
