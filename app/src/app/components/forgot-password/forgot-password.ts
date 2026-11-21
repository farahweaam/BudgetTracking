
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {

  resetForm: FormGroup;
  submitted = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: Auth
  ) {
    this.resetForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  get f() {
    return this.resetForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      const email = this.resetForm.get('email')?.value;

      await this.auth.resetPassword(email);

      this.successMessage =
        'If an account exists with this email, a password reset link has been sent. Please check your inbox.';

      this.resetForm.reset();

    } catch (error) {
      const firebaseError = error as FirebaseError;

      switch (firebaseError.code) {
        case 'auth/invalid-email':
          this.errorMessage =
            'Please enter a valid email address.';
          break;

        case 'auth/too-many-requests':
          this.errorMessage =
            'Too many requests. Please try again later.';
          break;

        case 'auth/network-request-failed':
          this.errorMessage =
            'Network error. Please check your internet connection.';
          break;

        default:
          this.errorMessage =
            'Unable to send the reset email. Please try again.';
          console.error(error);
      }

    } finally {
      this.loading = false;
    }
  }
}
