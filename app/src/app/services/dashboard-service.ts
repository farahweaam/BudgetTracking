import { Injectable, NgZone, inject } from '@angular/core';
import { collection, onSnapshot } from 'firebase/firestore';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';
import { firebaseAuth, db } from '../firebase.config';
import { Budget } from '../models/budget';
import { Goal } from '../models/goal';
import { Expense } from '../models/expense';
import { BudgetService } from './budget-service';
import { GoalService } from './goal';

export interface DashboardData {
  budgets: Budget[];
  goals: Goal[];
  expenses: Expense[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private zone = inject(NgZone);
  private budgetService = inject(BudgetService);
  private goalService = inject(GoalService);

  getData(): Observable<DashboardData> {
    // Wait for Firebase to restore the session before reading the user
    return from(firebaseAuth.authStateReady()).pipe(
      switchMap(() => {
        const uid = firebaseAuth.currentUser?.uid;
        if (!uid) throw new Error('Not logged in');

        const expenses$ = new Observable<Expense[]>((sub) => {
          const unsub = onSnapshot(
            collection(db, `users/${uid}/expenses`),
            (snap) =>
              this.zone.run(() =>
                sub.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense))
              ),
            (err) => this.zone.run(() => sub.error(err))
          );
          return unsub;
        });

        return combineLatest([
          this.budgetService.getBudgets(),
          this.goalService.getGoals(),
          expenses$,
        ]).pipe(
          map(([budgets, goals, expenses]): DashboardData => ({
            budgets,
            goals,
            expenses,
          }))
        );
      })
    );
  }
}