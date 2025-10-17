import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClh-loC4zuSB5N3RYCBQwbowbWdE02JDQk",
  authDomain: "ardhjeshpenzime.firebaseapp.com",
  projectId: "ardhjeshpenzime",
  storageBucket: "ardhjeshpenzime.firebasestorage.app",
  messagingSenderId: "113999083755",
  appId: "1:113999083755:web:84af75a6a91fb4e801f84e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
