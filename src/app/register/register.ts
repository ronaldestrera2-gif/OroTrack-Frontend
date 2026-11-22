import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { Logo } from '../logo/logo';
import { passwordsMatch } from '../validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './register.html',
  styleUrl: '../login/login.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  loading = signal(false);
  done = signal(false);
  shake = signal(false);
  showPassword = signal(false);
  error = signal('');
  serverErrors = signal<Record<string, string>>({});

  roles = [
    { value: 'inventory', title: 'Inventory', text: 'Records materials and stock movements.' },
    { value: 'management', title: 'Management', text: 'Reviews the dashboard and reports.' },
  ];

  form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
    },
    { validators: [passwordsMatch] },
  );

  invalid(field: 'name' | 'email' | 'role' | 'password' | 'confirm'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    this.error.set('');
    this.serverErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.nudge();
      return;
    }

    this.loading.set(true);
    const { name, email, role, password } = this.form.getRawValue();

    this.auth.register({ name: name.trim(), email: email.trim(), role, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: (err) => {
        this.loading.set(false);

        const errors = err?.error?.errors as Record<string, string[]> | undefined;

        if (errors) {
          const mapped: Record<string, string> = {};
          for (const key of Object.keys(errors)) {
            mapped[key] = errors[key][0];
          }
          this.serverErrors.set(mapped);
        } else {
          this.error.set(err?.error?.message ?? 'Cannot connect to the server.');
        }

        this.nudge();
      },
    });
  }

  private nudge(): void {
    this.shake.set(true);
    setTimeout(() => this.shake.set(false), 500);
  }
}