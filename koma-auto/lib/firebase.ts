import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy-DMRYCs_twjDLbYXEpAtKldDJKGWy5M",
  authDomain: "koma-kz.firebaseapp.com",
  projectId: "koma-kz",
  storageBucket: "koma-kz.firebasestorage.app",
  messagingSenderId: "586887434593",
  appId: "1:586887434593:web:34797d90996e967d31f520"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
