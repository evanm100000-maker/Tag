import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, remove, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBu8Zjk-ed-HNm8_trZbIJcNz_i1eKP4vU",
  authDomain: "tagscanner-f9c49.firebaseapp.com",
  projectId: "tagscanner-f9c49",
  storageBucket: "tagscanner-f9c49.firebasestorage.app",
  messagingSenderId: "836114316053",
  appId: "1:836114316053:web:6387403de12a3c49fd871c",
  measurementId: "G-HGYGDMLY70",
  // Correct database URL for Europe region
  databaseURL: "https://tagscanner-f9c49-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const getAllTags = async () => {
  try {
    const snapshot = await get(ref(db, "tags"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading tags', err);
    return [];
  }
};

export const saveTag = async (tag) => {
  try {
    await set(ref(db, "tags/" + tag.code), tag);
    return { success: true };
  } catch (err) {
    console.error('Error saving tag', err);
    return { success: false, error: err.message };
  }
};

export const removeTag = async (code) => {
  try {
    await remove(ref(db, "tags/" + code));
    return true;
  } catch (err) {
    console.error('Error removing tag', err);
    return false;
  }
};

export const disableTag = async (code, disabled) => {
  try {
    await update(ref(db, "tags/" + code), { disabled });
    return true;
  } catch (err) {
    console.error('Error disabling tag', err);
    return false;
  }
};

export const validateEntry = async (code) => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `tags/${code}`));

    if (!snapshot.exists()) {
      return { valid: false, reason: 'Not Registered' };
    }

    const tag = snapshot.val();
    
    if (tag.disabled) {
      return { valid: false, reason: 'Tag has been disabled' };
    }

    const now = new Date();
    
    if (tag.validFrom) {
      const from = new Date(tag.validFrom);
      if (now < from) {
        return { valid: false, reason: 'Not Valid Yet' };
      }
    }
    
    if (tag.validUntil) {
      const until = new Date(tag.validUntil);
      if (now > until) {
        return { valid: false, reason: 'OUT OF DATE' };
      }
    }

    // Update scan count
    const todayStr = now.toISOString().split('T')[0];
    let newCount = 1;
    
    if (tag.lastScannedDate === todayStr) {
      newCount = (tag.scanCountToday || 0) + 1;
    }

    await update(ref(db, `tags/${code}`), {
      lastScannedDate: todayStr,
      scanCountToday: newCount
    });

    return { 
      valid: true, 
      scanCountToday: newCount,
      name: tag.name || 'Unknown',
      validUntil: tag.validUntil || 'Never'
    };
  } catch (error) {
    console.error('Error validating', error);
    return { valid: false, reason: error.message ? `DB Error: ${error.message}` : 'Database Error' };
  }
};
