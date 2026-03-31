
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAshDNbVZZzwPaJOfVU-15UIEKAaJe1byg",
  authDomain: "app-contratos-easybyz-novo.firebaseapp.com",
  projectId: "app-contratos-easybyz-novo",
  storageBucket: "app-contratos-easybyz-novo.firebasestorage.app",
  messagingSenderId: "74109898713",
  appId: "1:74109898713:web:8ed1446f3242505ea753c8",
  measurementId: "G-7PV4XTVE06"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
