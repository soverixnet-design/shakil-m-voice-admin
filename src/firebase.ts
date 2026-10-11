import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "gen-lang-client-0043151803",
  appId: "1:702890155720:web:4f148649f736378c948ffd",
  apiKey: "AIzaSyAU9znPpekTqD1Ezx8mgou0QEuqMED3kRc",
  authDomain: "gen-lang-client-0043151803.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-22dd0b7a-14da-47df-9bc8-d4b58ab5ab0b",
  storageBucket: "gen-lang-client-0043151803.firebasestorage.app",
  messagingSenderId: "702890155720",
  oAuthClientId: "702890155720-apviuhq9h3h93miibnmc9sn2gocdp5a3.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot
};
export type { FirebaseUser };
