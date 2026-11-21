import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore, collection, collectionData, addDoc,
  doc, updateDoc, deleteDoc, query, orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Goal } from '../models/goal';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  private get uid(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not logged in');
    return user.uid;
  }

  private col() {
    return collection(this.fs, `users/${this.uid}/goals`);
  }

  getGoals(): Observable<Goal[]> {
    return collectionData(query(this.col(), orderBy('createdAt', 'desc')), {
      idField: 'id',
    }) as Observable<Goal[]>;
  }

  addGoal(goal: Goal) {
    return addDoc(this.col(), { ...goal, createdAt: Date.now() });
  }

  updateGoal(id: string, changes: Partial<Goal>) {
    return updateDoc(doc(this.fs, `users/${this.uid}/goals/${id}`), changes);
  }

  deleteGoal(id: string) {
    return deleteDoc(doc(this.fs, `users/${this.uid}/goals/${id}`));
  }
}