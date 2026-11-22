import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'inventory' | 'management';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
}

export interface UserForm {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface ResetRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  created_at: string;
  approved_at: string | null;
  expires_at: string | null;
  used_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class UserApi {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getUsers(): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(`${this.baseUrl}/users`);
  }

  createUser(data: UserForm): Observable<UserItem> {
    return this.http.post<UserItem>(`${this.baseUrl}/users`, data);
  }

  updateUser(id: number, data: UserForm): Observable<UserItem> {
    return this.http.put<UserItem>(`${this.baseUrl}/users/${id}`, data);
  }

  approveUser(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/users/${id}/approve`, {});
  }

  rejectUser(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/users/${id}/reject`, {});
  }

  suspendUser(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/users/${id}/suspend`, {});
  }

  reactivateUser(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/users/${id}/reactivate`, {});
  }

  getResetRequests(): Observable<ResetRequest[]> {
    return this.http.get<ResetRequest[]>(`${this.baseUrl}/password-resets`);
  }

  approveReset(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/password-resets/${id}/approve`, {});
  }

  rejectReset(id: number): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/password-resets/${id}/reject`, {});
  }
}