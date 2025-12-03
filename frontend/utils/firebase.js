// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vingo-food-app-9fff7.firebaseapp.com",
  projectId: "vingo-food-app-9fff7",
  storageBucket: "vingo-food-app-9fff7.firebasestorage.app",
  messagingSenderId: "849936671874",
  appId: "1:849936671874:web:21fcfa4ef67689149ac09b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export {app,auth}