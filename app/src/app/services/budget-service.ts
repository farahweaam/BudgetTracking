import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore, collection, collectionData, addDoc,
  doc, updateDoc, deleteDoc, query, orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Budget } from '../models/budget';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private fs = inject(Firestore);
  private auth = inject(Auth);

  private get uid(): string {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not logged in');
    return user.uid;
  }

  private col() {
    return collection(this.fs, `users/${this.uid}/budgets`);
  }

  getBudgets(): Observable<Budget[]> {
    return collectionData(query(this.col(), orderBy('createdAt', 'desc')), {
      idField: 'id',
    }) as Observable<Budget[]>;
  }

  addBudget(b: Budget) {
    return addDoc(this.col(), { ...b, createdAt: Date.now() });
  }

  updateBudget(id: string, changes: Partial<Budget>) {
    return updateDoc(doc(this.fs, `users/${this.uid}/budgets/${id}`), changes);
  }

  deleteBudget(id: string) {
    return deleteDoc(doc(this.fs, `users/${this.uid}/budgets/${id}`));
  }
}