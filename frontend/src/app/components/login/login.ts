
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(
  private fb: FormBuilder,
  private router: Router,
  private auth: Auth,
  private cdr: ChangeDetectorRef
) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (history.state?.registrationSuccess) {
      this.successMessage =
        'Your account has been created successfully. Please log in.';
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    try {
      const { email, password, rememberMe } =
        this.loginForm.getRawValue();

      await this.auth.login(email, password, rememberMe);

      this.successMessage = 'Login successful!';
this.cdr.detectChanges();

      // Temporary: we'll connect the dashboard route here.
      // this.router.navigate(['/dashboard']);

    } catch (error) {
      const firebaseError = error as FirebaseError;

      switch (firebaseError.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          this.errorMessage =
            'Incorrect email or password. Please try again.';
          break;

        case 'auth/invalid-email':
          this.errorMessage =
            'Please enter a valid email address.';
          break;

        case 'auth/too-many-requests':
          this.errorMessage =
            'Too many attempts. Please try again later.';
          break;

        case 'auth/network-request-failed':
          this.errorMessage =
            'Network error. Please check your internet connection.';
          break;

        default:
          this.errorMessage =
            'Login failed. Please try again.';
          console.error(error);
      }

    } 
    finally {
  this.loading = false;
  this.cdr.detectChanges();
}
this.cdr.detectChanges();
  }
}
