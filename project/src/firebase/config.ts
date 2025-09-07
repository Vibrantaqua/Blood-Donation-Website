// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGJD1abYddcRRN8_fKuZli4qEhuqZYD64",
  authDomain: "db-project-e5a4c.firebaseapp.com",
  projectId: "db-project-e5a4c",
  storageBucket: "db-project-e5a4c.firebasestorage.app",
  messagingSenderId: "588840129780",
  appId: "1:588840129780:web:b7360ccbb8d0a99da07aa1",
  measurementId: "G-Z1H84VE0CL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);