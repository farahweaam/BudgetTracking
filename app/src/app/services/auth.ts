
import { Injectable } from '@angular/core';


import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User
} from 'firebase/auth';


import { firebaseAuth } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  get currentUser(): User | null {
    return firebaseAuth.currentUser;
  }

  // REGISTER
  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<User> {

    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    await updateProfile(credential.user, {
      displayName: fullName
    });

    return credential.user;
  }

  // LOGIN
 
async login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<User> {

  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(firebaseAuth, persistence);

  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password
  );

  return credential.user;
}


  // FORGOT PASSWORD
  async resetPassword(email: string): Promise<void> {

    await sendPasswordResetEmail(firebaseAuth, email);
  }

  // LOGOUT
  async logout(): Promise<void> {

    await signOut(firebaseAuth);
  }

  // AUTHENTICATION STATE
  onAuthStateChanged(callback: (user: User | null) => void): () => void {

    return onAuthStateChanged(firebaseAuth, callback);
  }
}
