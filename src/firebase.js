import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz8zg3R_SKTKSkBKfrL7qvqzmUz0Df6Co",
  authDomain: "hanawap-app.firebaseapp.com",
  projectId: "hanawap-app",
  storageBucket: "hanawap-app.firebasestorage.app",
  messagingSenderId: "1008304257929",
  appId: "1:1008304257929:web:5d11bbdf8070a3ea1f3f58"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;