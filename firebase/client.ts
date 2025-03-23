import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4A9xgVY8HJCxsAfUV7pJrZJ0XzMlYTAo",
  authDomain: "prepwork-3218c.firebaseapp.com",
  projectId: "prepwork-3218c",
  storageBucket: "prepwork-3218c.firebasestorage.app",
  messagingSenderId: "565448063562",
  appId: "1:565448063562:web:bc9c140399b7a922b144b3",
  measurementId: "G-8BLQE3PG30"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)