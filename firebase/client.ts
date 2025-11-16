// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBFyy-Z-OEI0DMeGgm_qeEmaNvbMmhAw6A",
    authDomain: "ai-prep-34010.firebaseapp.com",
    projectId: "ai-prep-34010",
    storageBucket: "ai-prep-34010.firebasestorage.app",
    messagingSenderId: "421986680776",
    appId: "1:421986680776:web:94d1f8f683939c80820afd",
    measurementId: "G-JX3JCHZKJJ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);