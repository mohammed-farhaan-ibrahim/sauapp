import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0n8LNaPSUimuwzFiH3uLfSEaw4LqYVpg",
  authDomain: "sauapp2025.firebaseapp.com",
  projectId: "sauapp2025",
  storageBucket: "sauapp2025.appspot.com",
  messagingSenderId: "143635054863",
  appId: "1:143635054863:web:01a250fce4adeac9433e7a",
  measurementId: "G-XCF0BGLD4M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable Auth Persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
const db = getFirestore(app);

export { app, db, auth };