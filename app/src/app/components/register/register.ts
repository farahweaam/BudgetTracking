
import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { FirebaseError } from 'firebase/app';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};


@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerForm: FormGroup;
  submitted = false;
  activePolicy: 'terms' | 'privacy' | null = null;
  loading = false;
successMessage = '';
errorMessage = '';

openPolicy(policy: 'terms' | 'privacy'): void {
  this.activePolicy = policy;
}

closePolicy(): void {
  this.activePolicy = null;
}

  constructor(
  private fb: FormBuilder,
  private auth: Auth,
  private router: Router
) {
  this.registerForm = this.fb.group(
    {
      fullName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      confirmPassword: ['', Validators.required],

      terms: [false, Validators.requiredTrue]
    },
    {
      validators: passwordMatchValidator
    }
  );
}

  get f() {
    return this.registerForm.controls;
  }

  async onSubmit(): Promise<void> {
  this.successMessage = '';
  this.errorMessage = '';

  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  try {
    const { fullName, email, password } =
      this.registerForm.getRawValue();

    await this.auth.register(fullName, email, password);

    this.successMessage =
  'Your account has been created successfully!';

setTimeout(() => {
  this.router.navigate(['/login'], {
    state: { registrationSuccess: true }
  });
}, 1200);

  } catch (error) {
    const firebaseError = error as FirebaseError;

    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        this.errorMessage =
          'An account already exists with this email address.';
        break;

      case 'auth/invalid-email':
        this.errorMessage =
          'Please enter a valid email address.';
        break;

      case 'auth/weak-password':
        this.errorMessage =
          'Please choose a stronger password.';
        break;

      case 'auth/network-request-failed':
        this.errorMessage =
          'Network error. Please check your internet connection.';
        break;

      default:
        this.errorMessage =
          'Registration failed. Please try again.';
        console.error(error);
    }

  } finally {
    this.loading = false;
  }
}
}
