
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
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

@NgModule({
  declarations: [
    App,
    Goals,
    BudgetForm,
    Dashboard,
    Register,
    Login,
    AuthLayout,
    ForgotPassword
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [App],
})
export class AppModule {}
