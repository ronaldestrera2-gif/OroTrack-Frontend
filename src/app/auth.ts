import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export type Role = 'admin' | 'inventory' | 'management';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  name: string;
  email: string;
  role: string;
  password: string;
}

const TOKEN_KEY = 'orotrack_token';
const USER_KEY = 'orotrack_user';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'http://127.0.0.1:8000/api';

  user = signal<AuthUser | null>(this.loadUser());

  isLoggedIn = computed(() => this.user() !== null);

  canEdit = computed(() => {
    const role = this.user()?.role;
    return role === 'admin' || role === 'inventory';
  });

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.startSession(res)));
  }

  register(data: RegisterData): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, data);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/password/forgot`, { email });
  }

  resetPassword(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/password/reset`, { email, password })
      .pipe(tap((res) => this.startSession(res)));
  }

  logout(): void {
    const done = () => {
      this.clearSession();
      this.router.navigate(['/login']);
    };
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe({ next: done, error: done });
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private startSession(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.user.set(res.user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}