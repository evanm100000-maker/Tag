import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBu8Zjk-ed-HNm8_trZbIJcNz_i1eKP4vU",
  authDomain: "tagscanner-f9c49.firebaseapp.com",
  projectId: "tagscanner-f9c49",
  storageBucket: "tagscanner-f9c49.firebasestorage.app",
  messagingSenderId: "836114316053",
  appId: "1:836114316053:web:6387403de12a3c49fd871c",
  measurementId: "G-HGYGDMLY70",
  databaseURL: "https://tagscanner-f9c49-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const code = "8410525278921";

console.log("Starting write...");

set(ref(db, "tags/" + code), {
  code: code,
  name: "Test User",
  type: "barcode",
  disabled: false
}).then(() => {
  console.log("Successfully added barcode to Firebase!");
  process.exit(0);
}).catch((err) => {
  console.error("Error writing:", err);
  process.exit(1);
});
