import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 import { Goals } from './goals/goals';
 import { BudgetForm } from './budget-form/budget-form';
import { Dashboard } from './dashboard/dashboard';
const routes: Routes = [
   { path: 'goals', component: Goals },
   { path: 'budget', component: BudgetForm },
   { path: 'dashboard', component: Dashboard },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

  