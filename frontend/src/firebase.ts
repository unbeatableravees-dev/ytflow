import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// User's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBUPaD5LH1GuesQpjWRjcNFwG-oZxGNdA",
  authDomain: "ytdownloader-d4673.firebaseapp.com",
  projectId: "ytdownloader-d4673",
  storageBucket: "ytdownloader-d4673.firebasestorage.app",
  messagingSenderId: "120418530428",
  appId: "1:120418530428:web:f661c72edd9a093cca05f9",
  measurementId: "G-X042H0TW94"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
