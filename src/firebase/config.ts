import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOmqCPLFXLMrQWPArFswOfmeA7Jo_lo2E",
  authDomain: "rifas-skins.firebaseapp.com",
  projectId: "rifas-skins",
  storageBucket: "rifas-skins.appspot.com",
  messagingSenderId: "194879378927",
  appId: "1:194879378927:web:b5f976199332562e6c521a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 