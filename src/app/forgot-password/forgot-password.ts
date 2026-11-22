import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  loading = signal(false);
  done = signal(false);
  shake = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  invalid(): boolean {
    const control = this.form.controls.email;
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

    this.auth.forgotPassword(this.form.controls.email.value.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Cannot connect to the server.');
        this.nudge();
      },
    });
  }

  private nudge(): void {
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 500);
  }
}