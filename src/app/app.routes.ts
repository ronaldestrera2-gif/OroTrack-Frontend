import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Landing } from './landing/landing';
import { Login } from './login/login';
import { Materials } from './materials/materials';
import { Profile } from './profile/profile';
import { Register } from './register/register';
import { Reports } from './reports/reports';
import { Transactions } from './transactions/transactions';
import { Users } from './users/users';
import { authGuard, roleGuard } from './auth-guard';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'reports', component: Reports, canActivate: [authGuard] },
  {
    path: 'materials',
    component: Materials,
    canActivate: [authGuard, roleGuard(['admin', 'inventory'])],
  },
  {
    path: 'transactions',
    component: Transactions,
    canActivate: [authGuard, roleGuard(['admin', 'inventory'])],
  },
  {
    path: 'users',
    component: Users,
    canActivate: [authGuard, roleGuard(['admin'])],
  },
  { path: '**', redirectTo: 'dashboard' },
];