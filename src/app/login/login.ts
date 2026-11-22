import { AfterViewInit, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { Logo } from '../logo/logo';
import { passwordsMatch } from '../validators';

const EMAIL_KEY = 'orotrack_remembered_email';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  mode = signal<'signin' | 'reset'>('signin');
  resetEmail = signal('');

  error = signal('');
  loading = signal(false);
  showPassword = signal(false);
  capsOn = signal(false);
  shake = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  resetForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: [passwordsMatch] },
  );

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const saved = this.readSavedEmail();
    if (saved) {
      this.form.patchValue({ email: saved, remember: true });
    }
  }

  ngAfterViewInit(): void {
    const id = this.form.controls.email.value ? 'password' : 'email';
    document.getElementById(id)?.focus();
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  checkCaps(event: KeyboardEvent): void {
    this.capsOn.set(event.getModifierState?.('CapsLock') ?? false);
  }

  invalid(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  invalidReset(field: 'password' | 'confirm'): boolean {
    const control = this.resetForm.controls[field];
    return control.invalid && control.touched;
  }

  submit(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.nudge();
      return;
    }

    this.loading.set(true);
    const { email, password, remember } = this.form.getRawValue();
    const cleanEmail = email.trim();

    this.auth.login(cleanEmail, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.saveEmail(remember ? cleanEmail : null);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);

        // The administrator approved a password reset for this email
        if (err?.status === 409 && err?.error?.reset_required) {
          this.resetEmail.set(err.error.email ?? cleanEmail);
          this.resetForm.reset();
          this.showPassword.set(false);
          this.mode.set('reset');
          return;
        }

        this.error.set(err?.error?.message ?? 'Cannot connect to the server.');
        this.nudge();
      },
    });
  }

  submitReset(): void {
    this.error.set('');

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.nudge();
      return;
    }

    this.loading.set(true);

    this.auth.resetPassword(this.resetEmail(), this.resetForm.controls.password.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const errors = err?.error?.errors;
        this.error.set(
          errors?.email?.[0] ??
            errors?.password?.[0] ??
            err?.error?.message ??
            'Something went wrong. Please try again.',
        );
        this.nudge();
      },
    });
  }

  cancelReset(): void {
    this.error.set('');
    this.form.patchValue({ password: '' });
    this.mode.set('signin');
  }

  private nudge(): void {
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 500);
  }

  private readSavedEmail(): string {
    try {
      return localStorage.getItem(EMAIL_KEY) ?? '';
    } catch {
      return '';
    }
  }

  private saveEmail(email: string | null): void {
    try {
      if (email) {
        localStorage.setItem(EMAIL_KEY, email);
      } else {
        localStorage.removeItem(EMAIL_KEY);
      }
    } catch {
      // Storage is not available. Nothing to do.
    }
  }
}