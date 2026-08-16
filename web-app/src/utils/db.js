import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBu8Zjk-ed-HNm8_trZbIJcNz_i1eKP4vU",
  authDomain: "tagscanner-f9c49.firebaseapp.com",
  projectId: "tagscanner-f9c49",
  storageBucket: "tagscanner-f9c49.firebasestorage.app",
  messagingSenderId: "836114316053",
  appId: "1:836114316053:web:6387403de12a3c49fd871c",
  measurementId: "G-HGYGDMLY70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getAllTags = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "tags"));
    const tags = [];
    querySnapshot.forEach((doc) => {
      tags.push(doc.data());
    });
    return tags;
  } catch (err) {
    console.error('Error reading tags', err);
    return [];
  }
};

export const saveTag = async (tag) => {
  try {
    await setDoc(doc(db, "tags", tag.code), tag);
    return true;
  } catch (err) {
    console.error('Error saving tag', err);
    return false;
  }
};

export const removeTag = async (code) => {
  try {
    await deleteDoc(doc(db, "tags", code));
    return true;
  } catch (err) {
    console.error('Error removing tag', err);
    return false;
  }
};

export const disableTag = async (code, disabled) => {
  try {
    await updateDoc(doc(db, "tags", code), { disabled });
    return true;
  } catch (err) {
    console.error('Error disabling tag', err);
    return false;
  }
};

export const validateEntry = async (code) => {
  try {
    const docRef = doc(db, "tags", code);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { valid: false, reason: 'Code not found in system' };
    }

    const tag = docSnap.data();
    if (tag.disabled) {
      return { valid: false, reason: 'Tag has been disabled by admin' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating', error);
    return { valid: false, reason: 'Error connecting to database' };
  }
};
