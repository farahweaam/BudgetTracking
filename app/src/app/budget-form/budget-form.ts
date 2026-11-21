import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Budget } from '../models/budget';
import { BudgetService } from '../services/budget-service';

// Group-level validator: category limits must not exceed the income
function limitsWithinIncome(group: AbstractControl): ValidationErrors | null {
  const income = Number(group.get('totalIncome')?.value) || 0;
  const cats = group.get('categories') as FormArray;
  const total = cats.controls.reduce(
    (sum, c) => sum + (Number(c.get('limit')?.value) || 0), 0
  );
  return total > income ? { overBudget: true } : null;
}

@Component({
  selector: 'app-budget-form',
  standalone: false,
  templateUrl: './budget-form.html',
  styleUrl: './budget-form.css',
})
export class BudgetForm implements OnInit {
  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);

  budgets$!: Observable<Budget[]>;
  editingId: string | null = null;
  errorMsg = '';

  form = this.fb.nonNullable.group(
    {
      month: ['', Validators.required],
      totalIncome: [0, [Validators.required, Validators.min(1)]],
      categories: this.fb.array([this.newCategory('Rent', 0)]),
    },
    { validators: limitsWithinIncome }
  );

  ngOnInit() {
    this.budgets$ = this.budgetService.getBudgets();
  }

  get f() { return this.form.controls; }
  get categories() { return this.form.controls.categories; }

  get totalLimits(): number {
    return this.categories.controls.reduce(
      (sum, c) => sum + (Number(c.value.limit) || 0), 0
    );
  }
  get remaining(): number {
    return (Number(this.form.value.totalIncome) || 0) - this.totalLimits;
  }

  newCategory(name = '', limit = 0) {
    return this.fb.nonNullable.group({
      name: [name, [Validators.required, Validators.minLength(2)]],
      limit: [limit, [Validators.required, Validators.min(0)]],
    });
  }

  addCategory() { this.categories.push(this.newCategory()); }

  removeCategory(i: number) {
    if (this.categories.length > 1) this.categories.removeAt(i);
  }

  async save() {
    this.errorMsg = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    try {
      if (this.editingId) {
        await this.budgetService.updateBudget(this.editingId, value);
      } else {
        await this.budgetService.addBudget(value);
      }
      this.reset();
    } catch (e: any) {
      this.errorMsg = e.message ?? 'Something went wrong';
    }
  }

  edit(b: Budget) {
    this.editingId = b.id!;
    this.form.patchValue({ month: b.month, totalIncome: b.totalIncome });
    this.categories.clear();
    b.categories.forEach(c => this.categories.push(this.newCategory(c.name, c.limit)));
  }

  async remove(b: Budget) {
    if (confirm(`Delete the ${b.month} budget?`)) await this.budgetService.deleteBudget(b.id!);
  }

  reset() {
    this.editingId = null;
    this.form.reset({ month: '', totalIncome: 0 });
    this.categories.clear();
    this.categories.push(this.newCategory());
  }
}