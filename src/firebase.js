import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuEOphZEebt9nWJociTHdxOmPIjImmNRs",
  authDomain: "my-personal-finance-trac-d132e.firebaseapp.com",
  projectId: "my-personal-finance-trac-d132e",
  storageBucket: "my-personal-finance-trac-d132e.appspot.com", // ✅ FIXED THIS LINE
  messagingSenderId: "259539450308",
  appId: "1:259539450308:web:e9fe455464b5e28a30cc91",
  measurementId: "G-5W4LXJCVZX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
