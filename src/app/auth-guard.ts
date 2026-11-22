import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, Role } from './auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (roles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(Auth);
    const router = inject(Router);
    const role = auth.user()?.role;

    return role && roles.includes(role) ? true : router.createUrlTree(['/dashboard']);
  };
};