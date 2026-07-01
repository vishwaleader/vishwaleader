import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyByn-fsGhqcz3FRSIOIsYQA7mevKX77UTM",
    authDomain: "vishwaleader-techmedia.firebaseapp.com",
    projectId: "vishwaleader-techmedia",
    storageBucket: "vishwaleader-techmedia.firebasestorage.app",
    messagingSenderId: "242967598341",
    appId: "1:242967598341:web:831c1557dd5edcb153936c",
    measurementId: "G-B7ZMRKJWVF"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
