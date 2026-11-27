import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { Goal } from '../models/goal';
import { GoalService } from '../services/goal';
import { Router } from '@angular/router';
function futureDate(c: AbstractControl): ValidationErrors | null {
  if (!c.value) return null;
  const today = new Date().toISOString().slice(0, 10);
  return c.value < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-goals',
  standalone: false,
  templateUrl: './goals.html',
  styleUrl: './goals.css',
})
export class Goals implements OnInit {
  private fb = inject(FormBuilder);
  private goalService = inject(GoalService);
private router = inject(Router);

  goals$!: Observable<Goal[]>;
  editingId: string | null = null;
  errorMsg = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    targetAmount: [0, [Validators.required, Validators.min(1)]],
    currentAmount: [0, [Validators.required, Validators.min(0)]],
    deadline: ['', [Validators.required, futureDate]],
  });

  ngOnInit() {
    this.goals$ = this.goalService.getGoals();
  }

  get f() { return this.form.controls; }

  progress(g: Goal): number {
    if (!g.targetAmount) return 0;
    return Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
  }

  async save() {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    try {
      if (this.editingId) {
        await this.goalService.updateGoal(this.editingId, value);
      } else {
        await this.goalService.addGoal(value);
      }
      this.reset();
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMsg = e.message ?? 'Something went wrong';
    }
  }

  edit(g: Goal) {
    this.editingId = g.id!;
    this.form.patchValue(g);
  }

  async remove(g: Goal) {
    if (confirm(`Delete "${g.name}"?`)) await this.goalService.deleteGoal(g.id!);
  }

  reset() {
    this.editingId = null;
    this.form.reset({ name: '', targetAmount: 0, currentAmount: 0, deadline: '' });
  }
}