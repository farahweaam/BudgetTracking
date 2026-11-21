import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, combineLatest, map } from 'rxjs';
import { Budget } from '../models/budget';
import { Goal } from '../models/goal';
import { Expense } from '../models/expense';
import { BudgetService } from './budget-service';
import { GoalService } from './goal';

export interface DashboardData {
  budget: Budget | null;   // the most recent budget
  goals: Goal[];
  expenses: Expense[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private fs = inject(Firestore);
  private auth = inject(Auth);
  private budgetService = inject(BudgetService);
  private goalService = inject(GoalService);

  getData(): Observable<DashboardData> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Not logged in');

    const expenses$ = collectionData(
      collection(this.fs, `users/${uid}/expenses`),
      { idField: 'id' }
    ) as Observable<Expense[]>;

    return combineLatest([
      this.budgetService.getBudgets(),
      this.goalService.getGoals(),
      expenses$,
    ]).pipe(
      map(([budgets, goals, expenses]) => ({
        budget: budgets[0] ?? null,   // getBudgets() is sorted newest first
        goals,
        expenses,
      }))
    );
  }
}