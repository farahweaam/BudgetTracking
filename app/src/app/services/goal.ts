import { Injectable, NgZone, inject } from '@angular/core';
import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { firebaseAuth, db } from '../firebase.config';
import { Goal } from '../models/goal';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private zone = inject(NgZone);

  private get uid(): string {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('Not logged in');
    return user.uid;
  }

  private col() {
    return collection(db, `users/${this.uid}/goals`);
  }

  getGoals(): Observable<Goal[]> {
    return new Observable<Goal[]>((sub) => {
      let unsub: () => void = () => {};
      let closed = false;

      firebaseAuth.authStateReady().then(() => {
        if (closed) return;
        const q = query(this.col(), orderBy('createdAt', 'desc'));
        unsub = onSnapshot(
          q,
          (snap) =>
            this.zone.run(() =>
              sub.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Goal))
            ),
          (err) => this.zone.run(() => sub.error(err))
        );
      }).catch((err) => sub.error(err));

      return () => { closed = true; unsub(); };
    });
  }

  addGoal(goal: Goal) {
    return addDoc(this.col(), { ...goal, createdAt: Date.now() });
  }

  updateGoal(id: string, changes: Partial<Goal>) {
    return updateDoc(doc(db, `users/${this.uid}/goals/${id}`), changes);
  }

  deleteGoal(id: string) {
    return deleteDoc(doc(db, `users/${this.uid}/goals/${id}`));
  }
}