import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcEeMMbMPHE0cKzifYzbix50JKXxJ08dA",
  authDomain: "ideanfe.firebaseapp.com",
  projectId: "ideanfe",
  storageBucket: "ideanfe.firebasestorage.app",
  messagingSenderId: "594967076554",
  appId: "1:594967076554:web:7e028b25985e63c3735e33"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);