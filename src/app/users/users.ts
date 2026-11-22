import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../auth';
import { ResetRequest, UserApi, UserItem } from '../user-api';

type Tab = 'accounts' | 'resets';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private api = inject(UserApi);
  private fb = inject(FormBuilder);
  auth = inject(Auth);

  tab = signal<Tab>('accounts');
  users = signal<UserItem[]>([]);
  resets = signal<ResetRequest[]>([]);
  editingId = signal<number | null>(null);
  message = signal('');
  error = signal('');

  pendingUsers = computed(() => this.users().filter((u) => u.status === 'pending'));
  otherUsers = computed(() => this.users().filter((u) => u.status !== 'pending'));
  pendingResets = computed(() => this.resets().filter((r) => r.status === 'pending'));

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['inventory', Validators.required],
    password: ['', Validators.minLength(8)],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadUsers();
    this.loadResets();
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: () => this.error.set('Cannot load users. Is the backend running?'),
    });
  }

  loadResets(): void {
    this.api.getResetRequests().subscribe({
      next: (data) => this.resets.set(data),
      error: () => this.error.set('Cannot load password reset requests.'),
    });
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
    this.message.set('');
    this.error.set('');
  }

  // ---------- Account approvals ----------

  approveUser(u: UserItem): void {
    this.message.set('');
    this.error.set('');

    this.api.approveUser(u.id).subscribe({
      next: () => {
        this.message.set(`${u.name}'s account was approved. They can sign in now.`);
        this.loadUsers();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  rejectUser(u: UserItem): void {
    if (!confirm(`Reject the account request of "${u.name}"?`)) {
      return;
    }

    this.message.set('');
    this.error.set('');

    this.api.rejectUser(u.id).subscribe({
      next: () => {
        this.message.set(`${u.name}'s account request was rejected.`);
        this.loadUsers();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  // ---------- Suspend and reactivate ----------

  suspendUser(u: UserItem): void {
    const ok = confirm(
      `Suspend the account of "${u.name}"?\n\n` +
        'They will be signed out and cannot sign in until you reactivate the account. ' +
        'Their records are kept.',
    );

    if (!ok) {
      return;
    }

    this.message.set('');
    this.error.set('');

    this.api.suspendUser(u.id).subscribe({
      next: () => {
        this.message.set(`${u.name}'s account was suspended.`);
        this.loadUsers();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  reactivateUser(u: UserItem): void {
    this.message.set('');
    this.error.set('');

    this.api.reactivateUser(u.id).subscribe({
      next: () => {
        this.message.set(`${u.name}'s account was reactivated. They can sign in again.`);
        this.loadUsers();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  statusLabel(u: UserItem): string {
    if (u.status === 'approved') return 'Active';
    if (u.status === 'suspended') return 'Suspended';
    if (u.status === 'rejected') return 'Rejected';
    return 'Pending';
  }

  // ---------- Password reset requests ----------

  approveReset(r: ResetRequest): void {
    this.message.set('');
    this.error.set('');

    this.api.approveReset(r.id).subscribe({
      next: () => {
        this.message.set(
          `Reset approved for ${r.user.email}. They can set a new password the next time they sign in, within 24 hours.`,
        );
        this.loadResets();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  rejectReset(r: ResetRequest): void {
    if (!confirm(`Reject the password reset request of "${r.user.name}"?`)) {
      return;
    }

    this.message.set('');
    this.error.set('');

    this.api.rejectReset(r.id).subscribe({
      next: () => {
        this.message.set('Password reset request rejected.');
        this.loadResets();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  isExpired(r: ResetRequest): boolean {
    return r.status === 'approved' && !!r.expires_at && new Date(r.expires_at) < new Date();
  }

  resetLabel(r: ResetRequest): string {
    if (this.isExpired(r)) return 'Expired';
    if (r.status === 'pending') return 'Pending';
    if (r.status === 'approved') return 'Approved';
    if (r.status === 'used') return 'Used';
    return 'Rejected';
  }

  resetClass(r: ResetRequest): string {
    if (this.isExpired(r)) return 'low';
    if (r.status === 'pending') return 'pend';
    if (r.status === 'approved' || r.status === 'used') return 'ok';
    return 'low';
  }

  // ---------- Add and edit users ----------

  save(): void {
    this.message.set('');
    this.error.set('');

    const id = this.editingId();
    const data = this.form.getRawValue();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please enter a name, a valid email, and a password of at least 8 characters.');
      return;
    }

    if (!id && !data.password) {
      this.error.set('A password is required for a new user.');
      return;
    }

    const request = id ? this.api.updateUser(id, data) : this.api.createUser(data);

    request.subscribe({
      next: () => {
        this.message.set(id ? 'User updated.' : 'User added.');
        this.clearForm();
        this.loadUsers();
      },
      error: (err) => this.error.set(this.errorText(err)),
    });
  }

  edit(u: UserItem): void {
    this.message.set('');
    this.error.set('');
    this.editingId.set(u.id);
    this.form.reset({
      name: u.name,
      email: u.email,
      role: u.role,
      password: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      email: '',
      role: 'inventory',
      password: '',
    });
  }

  isSelf(u: UserItem): boolean {
    return u.id === this.auth.user()?.id;
  }

  private errorText(err: any): string {
    const errors = err?.error?.errors;
    if (errors) {
      const first = Object.values(errors)[0] as string[];
      return first[0];
    }
    return err?.error?.message ?? 'Something went wrong. Please try again.';
  }
}