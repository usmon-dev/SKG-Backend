/**
 * Initializes a Firebase app with the provided configuration and exports a reference to the Firestore database.
 * 
 * The Firebase configuration is loaded from environment variables, which should be set in the hosting environment.
 * 
 * @remarks
 * This module sets up the Firebase SDK and provides access to the Firestore database instance.
 * 
 * @example
 * 
 * import { db } from './config';
 * const snapshot = await db.collection('users').get();
 * 
 */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);