import { Component, inject } from '@angular/core';
import { Theme } from '../theme';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      class="theme-btn"
      [class.dark]="theme.isDark()"
      [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.title]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      (click)="theme.toggle()"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <g class="sun">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </g>
        <path class="moon" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  `,
  styles: [
    `
      .theme-btn {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 120;
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border: 1px solid #fde68a;
        border-radius: 50%;
        background: #fff;
        color: #d97706;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
        transition:
          transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 0.2s ease,
          background 0.3s ease,
          color 0.3s ease,
          border-color 0.3s ease;
      }

      .theme-btn:hover {
        transform: translateY(-2px) rotate(15deg);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
      }

      .theme-btn:active {
        transform: scale(0.88);
      }

      .theme-btn.dark {
        background: #2a2320;
        border-color: #4a3f38;
        color: #fcd34d;
      }

      svg {
        width: 22px;
        height: 22px;
        overflow: visible;
      }

      .sun,
      .moon {
        transform-box: fill-box;
        transform-origin: center;
        transition:
          transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.3s ease;
      }

      .moon {
        opacity: 0;
        transform: rotate(-90deg) scale(0.3);
      }

      .dark .sun {
        opacity: 0;
        transform: rotate(90deg) scale(0.3);
      }

      .dark .moon {
        opacity: 1;
        transform: none;
      }

      @media (max-width: 900px) {
        .theme-btn {
          right: 14px;
          bottom: 14px;
          width: 42px;
          height: 42px;
        }
      }

      @media print {
        .theme-btn {
          display: none;
        }
      }
    `,
  ],
})
export class ThemeToggle {
  theme = inject(Theme);
}