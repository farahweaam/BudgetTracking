import {
  AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { DashboardData, DashboardService } from '../services/dashboard-service';
import { BudgetService } from '../services/budget-service';
import { Budget } from '../models/budget';
import { firebaseAuth } from '../firebase.config';

Chart.register(...registerables);

const PALETTE = ['#204c3e', '#3f7d68', '#6fa894', '#a3cbbb', '#c9a227', '#c74747', '#858d89'];

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  private dashboardService = inject(DashboardService);
  private budgetService = inject(BudgetService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  @ViewChild('categoryChart') categoryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('varianceChart') varianceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('goalsChart') goalsCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
userName = signal('');
  budgets = signal<Budget[]>([]);
  hasBudget = signal(false);
  summary = signal({ income: 0, allocated: 0, spent: 0, savedPct: 0 });
  
  private async loadUser() {
  await firebaseAuth.authStateReady();
  const u = firebaseAuth.currentUser;
  this.userName.set(u?.displayName || u?.email?.split('@')[0] || '');
}
  ngAfterViewInit() {
    
  this.loadUser();
  // ...the rest stays as it is

    this.dashboardService
      .getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.update(d));
    this.destroyRef.onDestroy(() => this.charts.forEach(c => c.destroy()));
  }


  editBudget(b: Budget) {
    this.router.navigate(['/budget'], { queryParams: { edit: b.id } });
  }

  async deleteBudget(b: Budget) {
    if (confirm(`Delete the ${b.month} budget?`)) {
      await this.budgetService.deleteBudget(b.id!);
    }
  }

  private update(d: DashboardData) {
    // Newest month first
    const budgets = [...d.budgets].sort((a, b) => b.month.localeCompare(a.month));
    const months = new Set(budgets.map(b => b.month));

    // Combine categories with the same name across all budgets
    const limits = new Map<string, { name: string; limit: number }>();
    for (const b of budgets) {
      for (const c of b.categories) {
        const key = c.name.trim().toLowerCase();
        const cur = limits.get(key);
        limits.set(key, {
          name: cur?.name ?? c.name.trim(),
          limit: (cur?.limit ?? 0) + Number(c.limit),
        });
      }
    }
    const cats = [...limits.entries()].map(([key, v]) => ({ key, ...v }));

    // Only count expenses that fall in a month that has a budget
    const budgetExpenses = d.expenses.filter(e => months.has((e.date ?? '').slice(0, 7)));
    const spentBy = new Map<string, number>();
    for (const e of budgetExpenses) {
      const key = e.category.trim().toLowerCase();
      spentBy.set(key, (spentBy.get(key) ?? 0) + Number(e.amount));
    }

    const saved = d.goals.reduce((s, g) => s + Number(g.currentAmount), 0);
    const target = d.goals.reduce((s, g) => s + Number(g.targetAmount), 0);

    this.budgets.set(budgets);
    this.hasBudget.set(budgets.length > 0);
    this.summary.set({
      income: budgets.reduce((s, b) => s + Number(b.totalIncome), 0),
      allocated: cats.reduce((s, c) => s + c.limit, 0),
      spent: budgetExpenses.reduce((s, e) => s + Number(e.amount), 0),
      savedPct: target ? Math.min(1, saved / target) : 0,
    });

    // Rebuild charts on every data change (the data is small)
    this.charts.forEach(c => c.destroy());
    this.charts = [
      // 1. Budget split by category (all budgets combined)
      new Chart(this.categoryCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: cats.map(c => c.name),
          datasets: [{ data: cats.map(c => c.limit), backgroundColor: PALETTE }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
      }),

      // 2. Budget variance: limit vs actual spending per category
      new Chart(this.varianceCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: cats.map(c => c.name),
          datasets: [
            { label: 'Limit', data: cats.map(c => c.limit), backgroundColor: '#a3cbbb' },
            {
              label: 'Spent',
              data: cats.map(c => spentBy.get(c.key) ?? 0),
              backgroundColor: '#204c3e',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
      }),

      // 3. Savings goal progress (%)
      new Chart(this.goalsCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: d.goals.map(g => g.name),
          datasets: [{
            label: '% complete',
            data: d.goals.map(g =>
              g.targetAmount ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0
            ),
            backgroundColor: '#204c3e',
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { min: 0, max: 100 } },
          plugins: { legend: { display: false } },
        },
      }),
    ];
  }
}