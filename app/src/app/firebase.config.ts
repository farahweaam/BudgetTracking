import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);

export const firebaseAuth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);