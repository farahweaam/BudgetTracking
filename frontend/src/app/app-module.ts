import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { ForgotPassword } from './components/forgot-password/forgot-password';

@NgModule({
  declarations: [App, Register, Login, AuthLayout, ForgotPassword],

  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule],

  providers: [provideBrowserGlobalErrorListeners()],

  bootstrap: [App],
})
export class AppModule {}
