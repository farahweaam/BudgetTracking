
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Goals } from './goals/goals';
import { BudgetForm } from './budget-form/budget-form';
import { Dashboard } from './dashboard/dashboard';

import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { ForgotPassword } from './components/forgot-password/forgot-password';

const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: '', redirectTo: 'register', pathMatch: 'full' },
      { path: 'register', component: Register },
      { path: 'login', component: Login },
      { path: 'forgot-password', component: ForgotPassword }
    ]
  },

  { path: 'dashboard', component: Dashboard },
  { path: 'goals', component: Goals },
  { path: 'budget', component: BudgetForm },

  { path: '**', redirectTo: 'register' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
