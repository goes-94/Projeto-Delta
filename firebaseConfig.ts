// firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe8QwSysxpgFr_kZp600cyTpiwC2s7SrQ",
  authDomain: "tech-lion-saas-gestao.firebaseapp.com",
  projectId: "tech-lion-saas-gestao",
  storageBucket: "tech-lion-saas-gestao.firebasestorage.app",
  messagingSenderId: "16477152990",
  appId: "1:16477152990:web:da1872722d6f19f3a0044f"
};

// Evita inicializar Firebase múltiplas vezes (importante no Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa e exporta o Firestore
const db = getFirestore(app);

export { db };
