// Shembull i thirrjes:
perditesoTransaksionin("ID_UNIKALE_E_TRANSAKSIONIT", {
    shuma: 150.00,
    kategoria: "Ushqim",
});// Linja juaj e importit do të duket kështu (shtoni 'doc' dhe 'deleteDoc'):

import { 
    collection, 
    addDoc, 
    getDocs, 
    onSnapshot, 
    query, 
    orderBy,
    doc,        // Import i ri: Për të referuar një dokument specifik
    deleteDoc   // Import i ri: Për të fshirë atë dokument
} from 'firebase/firestore';import { initializeApp } from "firebase/app";
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
