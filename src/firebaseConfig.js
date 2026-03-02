// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // <-- O erro sumirá por causa dessa linha!
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcEeMMbMPHE0cKzifYzbix50JKXxJ08dA",
  authDomain: "ideanfe.firebaseapp.com",
  projectId: "ideanfe",
  storageBucket: "ideanfe.firebasestorage.app",
  messagingSenderId: "594967076554",
  appId: "1:594967076554:web:7e028b25985e63c3735e33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Exporta a ferramenta de Autenticação para usarmos no App.jsx
export const auth = getAuth(app);