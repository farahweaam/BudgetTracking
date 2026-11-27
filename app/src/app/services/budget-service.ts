import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot
} from 'firebase/firestore';
import { firebaseAuth, db } from '../firebase.config';
import { Budget } from '../models/budget';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private zone = inject(NgZone);

  private get uid(): string {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('Not logged in');
    return user.uid;
  }

  private col() {
    return collection(db, `users/${this.uid}/budgets`);
  }

  getBudgets(): Observable<Budget[]> {
    return new Observable<Budget[]>((sub) => {
      let unsub: () => void = () => {};
      let closed = false;

      firebaseAuth.authStateReady().then(() => {
        if (closed) return;
        const q = query(this.col(), orderBy('createdAt', 'desc'));
        unsub = onSnapshot(
          q,
          (snap) =>
            this.zone.run(() =>
              sub.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Budget))
            ),
          (err) => this.zone.run(() => sub.error(err))
        );
      }).catch((err) => sub.error(err));

      return () => { closed = true; unsub(); };
    });
  }

  addBudget(b: Budget) {
    return addDoc(this.col(), { ...b, createdAt: Date.now() });
  }

  updateBudget(id: string, changes: Partial<Budget>) {
    return updateDoc(doc(db, `users/${this.uid}/budgets/${id}`), changes);
  }

  deleteBudget(id: string) {
    return deleteDoc(doc(db, `users/${this.uid}/budgets/${id}`));
  }
}