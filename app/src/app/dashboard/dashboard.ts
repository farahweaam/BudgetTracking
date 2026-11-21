import {
  AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';
import { DashboardData, DashboardService } from '../services/dashboard-service';

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
  private destroyRef = inject(DestroyRef);

  @ViewChild('categoryChart') categoryCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('varianceChart') varianceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('goalsChart') goalsCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  hasBudget = signal(false);
  month = signal('');
  summary = signal({ income: 0, allocated: 0, spent: 0, savedPct: 0 });

  ngAfterViewInit() {
    this.dashboardService
      .getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.update(d));
    this.destroyRef.onDestroy(() => this.charts.forEach(c => c.destroy()));
  }

  private update(d: DashboardData) {
    const b = d.budget;
    const cats = b?.categories ?? [];

    // Only this budget's month
    const monthExpenses = b
      ? d.expenses.filter(e => e.date?.startsWith(b.month))
      : [];

    const spentBy = new Map<string, number>();
    for (const e of monthExpenses) {
      const key = e.category.trim().toLowerCase();
      spentBy.set(key, (spentBy.get(key) ?? 0) + Number(e.amount));
    }
    const spentTotal = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const allocated = cats.reduce((s, c) => s + Number(c.limit), 0);

    const saved = d.goals.reduce((s, g) => s + Number(g.currentAmount), 0);
    const target = d.goals.reduce((s, g) => s + Number(g.targetAmount), 0);

    this.hasBudget.set(!!b);
    this.month.set(b?.month ?? '');
    this.summary.set({
      income: b?.totalIncome ?? 0,
      allocated,
      spent: spentTotal,
      savedPct: target ? Math.min(1, saved / target) : 0,
    });

    // Rebuild charts on every data change (the data is small)
    this.charts.forEach(c => c.destroy());
    this.charts = [
      // 1. Budget split by category
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
              data: cats.map(c => spentBy.get(c.name.trim().toLowerCase()) ?? 0),
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