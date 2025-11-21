import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBo1iDRXxZLMoEwb2_g1nnMeugva5ogs6U",
  authDomain: "finwise-c5af5.firebaseapp.com",
  projectId: "finwise-c5af5",
  storageBucket: "finwise-c5af5.firebasestorage.app",
  messagingSenderId: "413898739808",
  appId: "1:413898739808:web:952885f71a44d9d3143305",
  measurementId: "G-PKZPK01VJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
