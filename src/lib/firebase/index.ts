import { initializeApp } from "firebase/app";import { getAuth } from "firebase/auth";import { getFirestore } from "firebase/firestore";
const envConfig={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};
export const firebaseConfigured=Boolean(envConfig.apiKey&&envConfig.projectId);
const config=firebaseConfigured?envConfig:{apiKey:"demo-api-key",authDomain:"ncns-report.invalid",projectId:"ncns-report-demo",appId:"1:000000000000:web:0000000000000000000000"};
export const app=initializeApp(config);export const auth=getAuth(app);export const db=getFirestore(app);
