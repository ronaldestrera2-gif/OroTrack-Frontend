import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Auth } from './auth';
import { Icon } from './icon/icon';
import { Logo } from './logo/logo';
import { ThemeToggle } from './theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo, Icon, ThemeToggle],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  auth = inject(Auth);
  private router = inject(Router);

  menuOpen = signal(false);
  confirmLogout = signal(false);

  // Pages that do not show the sidebar
  private publicPaths = ['/', '/login', '/register', '/forgot-password'];

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  showShell = computed(() => {
    const path = this.url().split('?')[0].split('#')[0];
    return this.auth.isLoggedIn() && !this.publicPaths.includes(path);
  });

  initial = computed(() => (this.auth.user()?.name ?? '?').charAt(0).toUpperCase());

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  askLogout(): void {
    this.menuOpen.set(false);
    this.confirmLogout.set(true);
  }

  cancelLogout(): void {
    this.confirmLogout.set(false);
  }

  doLogout(): void {
    this.confirmLogout.set(false);
    this.auth.logout();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.confirmLogout.set(false);
  }
}