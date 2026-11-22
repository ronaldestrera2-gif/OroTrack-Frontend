import { Injectable, computed, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const KEY = 'orotrack_theme';

@Injectable({ providedIn: 'root' })
export class Theme {
  mode = signal<ThemeMode>(this.initial());
  isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.apply(this.mode(), false);
  }

  toggle(): void {
    const next: ThemeMode = this.isDark() ? 'light' : 'dark';
    this.mode.set(next);
    this.apply(next, true);

    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage is not available. The choice just will not be remembered.
    }
  }

  private apply(mode: ThemeMode, animate: boolean): void {
    const root = document.documentElement;

    if (animate) {
      root.classList.add('theme-anim');
      setTimeout(() => root.classList.remove('theme-anim'), 350);
    }

    root.setAttribute('data-theme', mode);
  }

  private initial(): ThemeMode {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // Storage is not available. Fall back to the computer setting.
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}