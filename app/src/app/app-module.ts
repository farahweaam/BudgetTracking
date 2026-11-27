import { NgModule, provideBrowserGlobalErrorListeners ,DEFAULT_CURRENCY_CODE} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ReactiveFormsModule } from '@angular/forms';

// Friends' components
import { Goals } from './goals/goals';
import { BudgetForm } from './budget-form/budget-form';
import { Dashboard } from './dashboard/dashboard';

// Your authentication components
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { Navbar } from './navbar/navbar';

@NgModule({
  declarations: [
    App,
    Goals,
    BudgetForm,
    Dashboard,
    Register,
    Login,
    AuthLayout,
    ForgotPassword,
    Navbar,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],
  providers: [
  provideBrowserGlobalErrorListeners(),
  { provide: DEFAULT_CURRENCY_CODE, useValue: 'EGP' },
],
  bootstrap: [App],
})
export class AppModule {}
