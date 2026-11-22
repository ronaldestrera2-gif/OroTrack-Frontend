import { Component, input } from '@angular/core';

export type IconName =
  | 'dashboard'
  | 'materials'
  | 'transactions'
  | 'reports'
  | 'users'
  | 'money'
  | 'warning'
  | 'refresh'
  | 'logout'
  | 'plus'
  | 'check'
  | 'menu';

@Component({
  selector: 'app-icon',
  host: {
    '[style.margin-right.px]': 'gap()',
  },
  template: `
    <svg
      [class]="'icon is-' + name()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      [style.width.px]="size()"
      [style.height.px]="size()"
    >
      @switch (name()) {
        @case ('dashboard') {
          <g>
            <rect class="b b1" x="3" y="12" width="4" height="9" rx="1" />
            <rect class="b b2" x="10" y="7" width="4" height="14" rx="1" />
            <rect class="b b3" x="17" y="3" width="4" height="18" rx="1" />
          </g>
        }
        @case ('materials') {
          <g class="move">
            <path d="M21 8l-9-5-9 5 9 5 9-5z" />
            <path d="M3 8v8l9 5 9-5V8" />
            <path d="M12 13v8" />
          </g>
        }
        @case ('transactions') {
          <g>
            <g class="a1">
              <path d="M4 8h14" />
              <path d="M14 4l4 4-4 4" />
            </g>
            <g class="a2">
              <path d="M20 16H6" />
              <path d="M10 12l-4 4 4 4" />
            </g>
          </g>
        }
        @case ('reports') {
          <g class="move">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path class="ln l1" d="M9 13h6" />
            <path class="ln l2" d="M9 17h6" />
          </g>
        }
        @case ('users') {
          <g>
            <g class="p p1">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
            </g>
            <g class="p p2">
              <circle cx="17" cy="9" r="2.5" />
              <path d="M17 14.2a5 5 0 0 1 4.5 5" />
            </g>
          </g>
        }
        @case ('money') {
          <g class="move">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" />
            <path d="M7.5 10h7.5" />
            <path d="M7.5 12.5h7.5" />
          </g>
        }
        @case ('warning') {
          <g class="move">
            <path
              d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
            />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </g>
        }
        @case ('refresh') {
          <g class="move">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </g>
        }
        @case ('logout') {
          <g>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <g class="arrow">
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </g>
          </g>
        }
        @case ('plus') {
          <g class="move">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </g>
        }
        @case ('check') {
          <g class="move">
            <path d="M20 6L9 17l-5-5" />
          </g>
        }
        @case ('menu') {
          <g>
            <path class="m m1" d="M4 6h16" />
            <path class="m m2" d="M4 12h16" />
            <path class="m m3" d="M4 18h16" />
          </g>
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
        vertical-align: middle;
        line-height: 0;
      }

      .icon {
        display: block;
        overflow: visible;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .move,
      .b,
      .a1,
      .a2,
      .ln,
      .p,
      .arrow,
      .m {
        transform-box: fill-box;
        transform-origin: center;
      }

      .b {
        transform-origin: center bottom;
      }

      /* ---------- Click: shrink while pressed, bounce back when released ---------- */

      :host(:active) .icon,
      :host-context(.hv:active) .icon {
        transform: scale(0.8);
      }

      /* ---------- The page you just opened gets a small pop ---------- */

      :host-context(.side-nav a.active) .icon {
        animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* ---------- Hover animations ---------- */

      /* Dashboard: bars regrow */
      :host(:hover) .b,
      :host-context(.hv:hover) .b {
        animation: grow 0.6s ease both;
      }
      .b2 {
        animation-delay: 0.08s;
      }
      .b3 {
        animation-delay: 0.16s;
      }

      /* Materials: the box wiggles */
      :host(:hover) .is-materials .move,
      :host-context(.hv:hover) .is-materials .move {
        animation: wiggle 0.6s ease;
      }

      /* Stock In / Out: arrows slide the opposite ways */
      :host(:hover) .a1,
      :host-context(.hv:hover) .a1 {
        animation: slide-right 0.55s ease;
      }
      :host(:hover) .a2,
      :host-context(.hv:hover) .a2 {
        animation: slide-left 0.55s ease;
      }

      /* Reports: the page lifts and the lines redraw */
      :host(:hover) .is-reports .move,
      :host-context(.hv:hover) .is-reports .move {
        animation: lift 0.5s ease;
      }
      :host(:hover) .ln,
      :host-context(.hv:hover) .ln {
        stroke-dasharray: 6;
        animation: draw 0.6s ease both;
      }
      .l2 {
        animation-delay: 0.12s;
      }

      /* Users: the two people bob */
      :host(:hover) .p1,
      :host-context(.hv:hover) .p1 {
        animation: bob 0.6s ease;
      }
      :host(:hover) .p2,
      :host-context(.hv:hover) .p2 {
        animation: bob 0.6s ease 0.1s;
      }

      /* Money: the coin flips */
      :host(:hover) .is-money .move,
      :host-context(.hv:hover) .is-money .move {
        animation: flip 0.7s ease;
      }

      /* Warning: the sign shakes */
      :host(:hover) .is-warning .move,
      :host-context(.hv:hover) .is-warning .move {
        transform-origin: center bottom;
        animation: shake 0.6s ease;
      }

      /* Refresh: spins */
      :host(:hover) .is-refresh .move,
      :host-context(.hv:hover) .is-refresh .move {
        animation: spin 0.7s ease;
      }

      /* Logout: the arrow slides out */
      :host(:hover) .arrow,
      :host-context(.hv:hover) .arrow {
        animation: slide-right 0.5s ease;
      }

      /* Plus: turns */
      :host(:hover) .is-plus .move,
      :host-context(.hv:hover) .is-plus .move {
        animation: spin-quarter 0.4s ease;
      }

      /* Check: pops */
      :host(:hover) .is-check .move,
      :host-context(.hv:hover) .is-check .move {
        animation: pulse 0.45s ease;
      }

      /* Menu: the lines squeeze */
      :host(:hover) .m,
      :host-context(.hv:hover) .m {
        animation: squeeze 0.5s ease;
      }
      .m2 {
        animation-delay: 0.06s;
      }
      .m3 {
        animation-delay: 0.12s;
      }

      /* ---------- Keyframes ---------- */

      @keyframes pop {
        0% {
          transform: scale(0.6) rotate(-12deg);
        }
        60% {
          transform: scale(1.2) rotate(4deg);
        }
        100% {
          transform: none;
        }
      }

      @keyframes grow {
        0% {
          transform: scaleY(0.35);
        }
        60% {
          transform: scaleY(1.15);
        }
        100% {
          transform: scaleY(1);
        }
      }

      @keyframes wiggle {
        0%,
        100% {
          transform: rotate(0) translateY(0);
        }
        25% {
          transform: rotate(-10deg) translateY(-2px);
        }
        50% {
          transform: rotate(8deg) translateY(-1px);
        }
        75% {
          transform: rotate(-4deg);
        }
      }

      @keyframes slide-right {
        0%,
        100% {
          transform: translateX(0);
        }
        50% {
          transform: translateX(4px);
        }
      }

      @keyframes slide-left {
        0%,
        100% {
          transform: translateX(0);
        }
        50% {
          transform: translateX(-4px);
        }
      }

      @keyframes lift {
        0%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-3px);
        }
      }

      @keyframes draw {
        from {
          stroke-dashoffset: 6;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      @keyframes bob {
        0%,
        100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-3px);
        }
      }

      @keyframes flip {
        0%,
        100% {
          transform: scaleX(1);
        }
        50% {
          transform: scaleX(0.1);
        }
      }

      @keyframes shake {
        0%,
        100% {
          transform: rotate(0);
        }
        20% {
          transform: rotate(-12deg);
        }
        40% {
          transform: rotate(10deg);
        }
        60% {
          transform: rotate(-8deg);
        }
        80% {
          transform: rotate(5deg);
        }
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes spin-quarter {
        to {
          transform: rotate(90deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.3);
        }
      }

      @keyframes squeeze {
        0%,
        100% {
          transform: scaleX(1);
        }
        50% {
          transform: scaleX(0.55);
        }
      }
    `,
  ],
})
export class Icon {
  name = input.required<IconName>();
  size = input(20);
  gap = input(0);
}