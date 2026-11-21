
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { Register } from './components/register/register';
import { Login } from './components/login/login';

const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        redirectTo: 'register',
        pathMatch: 'full'
      },
      {
        path: 'register',
        component: Register
      },
      {
        path: 'login',
        component: Login
      },
      {
        path: 'forgot-password',
        component: ForgotPassword
      },
      
    ]
  },
  {
    path: '**',
    redirectTo: 'register'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
