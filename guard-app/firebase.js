import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdXK93_uP-soXLnxOIQKGMfliaHA-xAPw",
  authDomain: "projectxnpm.firebaseapp.com",
  projectId: "projectxnpm",
  storageBucket: "projectxnpm.firebasestorage.app",
  messagingSenderId: "238034199249",
  appId: "1:238034199249:web:1ebd9ecafcd98c6bf1dbf0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);