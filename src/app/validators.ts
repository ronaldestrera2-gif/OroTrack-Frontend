import { AbstractControl, ValidationErrors } from '@angular/forms';

// Checks that the "password" and "confirm" fields of a form group are the same
export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;

  return password && confirm && password !== confirm ? { mismatch: true } : null;
}