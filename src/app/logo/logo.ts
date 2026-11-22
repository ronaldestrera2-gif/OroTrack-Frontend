import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <svg
      class="logo-svg"
      [class.dark]="variant() === 'dark'"
      [class.animated]="animated()"
      [style.width.px]="width()"
      viewBox="0 0 480 180"
      role="img"
      aria-label="OroTrack"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="truck">
        <path class="load" d="M30 54C44 26 96 14 138 30C166 6 232 6 262 30C292 18 326 32 336 54Z" />
        <circle class="pebble" cx="90" cy="38" r="4" />
        <circle class="pebble" cx="150" cy="26" r="5" />
        <circle class="pebble" cx="215" cy="22" r="4" />
        <circle class="pebble" cx="280" cy="34" r="5" />
        <circle class="pebble" cx="120" cy="44" r="3" />
        <circle class="pebble" cx="190" cy="38" r="3" />

        <rect class="box" x="14" y="50" width="330" height="74" rx="10" />
        <rect class="rim" x="10" y="46" width="338" height="9" rx="4.5" />

        <text
          x="30"
          y="106"
          font-family="Arial, Helvetica, sans-serif"
          font-size="52"
          font-weight="800"
          textLength="298"
          lengthAdjust="spacingAndGlyphs"
        >
          <tspan class="text-a">Oro</tspan><tspan class="text-b">Track</tspan>
        </text>

        <rect class="chassis" x="344" y="34" width="9" height="32" rx="3" />
        <path class="cab" d="M352 124V66Q352 58 360 58H404L436 90H452Q462 90 462 100V124Z" />
        <path class="glass" d="M366 68H398L420 90H366Z" />
        <rect class="chassis" x="392" y="100" width="10" height="3" rx="1.5" />
        <circle class="light" cx="457" cy="104" r="4.5" />
        <rect class="chassis" x="8" y="122" width="462" height="12" rx="5" />

        <path class="fender" d="M44 142A26 26 0 0 1 96 142" />
        <path class="fender" d="M102 142A26 26 0 0 1 154 142" />
        <path class="fender" d="M382 142A26 26 0 0 1 434 142" />

        <g class="spin">
          <circle class="tire" cx="70" cy="142" r="22" />
          <circle class="hub" cx="70" cy="142" r="11" />
          <path class="spoke" d="M70 133V151M62.2 137.5L77.8 146.5M77.8 137.5L62.2 146.5" />
          <circle class="tire" cx="70" cy="142" r="3.5" />
        </g>
        <g class="spin">
          <circle class="tire" cx="128" cy="142" r="22" />
          <circle class="hub" cx="128" cy="142" r="11" />
          <path class="spoke" d="M128 133V151M120.2 137.5L135.8 146.5M135.8 137.5L120.2 146.5" />
          <circle class="tire" cx="128" cy="142" r="3.5" />
        </g>
        <g class="spin">
          <circle class="tire" cx="408" cy="142" r="22" />
          <circle class="hub" cx="408" cy="142" r="11" />
          <path class="spoke" d="M408 133V151M400.2 137.5L415.8 146.5M415.8 137.5L400.2 146.5" />
          <circle class="tire" cx="408" cy="142" r="3.5" />
        </g>
      </g>

      <path class="road" d="M0 170H480" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        line-height: 0;
        max-width: 100%;
      }

      .logo-svg {
        display: block;
        height: auto;
        max-width: 100%;
        overflow: visible;

        --box: #78350f;
        --rim: #92400e;
        --text-a: #ffffff;
        --text-b: #fcd34d;
        --cab: #f59e0b;
        --glass: #fef3c7;
        --chassis: #292524;
        --tire: #1c0a02;
        --tire-stroke: #1c0a02;
        --hub: #fde68a;
        --load: #a16207;
        --pebble: #78350f;
        --road: #a8a29e;
      }

      .logo-svg.dark {
        --box: #f59e0b;
        --rim: #fbbf24;
        --text-a: #451a03;
        --text-b: #7c2d12;
        --cab: #fef3c7;
        --glass: #78350f;
        --chassis: #d6b98c;
        --tire: #0c0a09;
        --tire-stroke: #fde68a;
        --hub: #fde68a;
        --load: #d97706;
        --pebble: #92400e;
        --road: #fde68a;
      }

      .box {
        fill: var(--box);
      }
      .rim {
        fill: var(--rim);
      }
      .text-a {
        fill: var(--text-a);
      }
      .text-b {
        fill: var(--text-b);
      }
      .cab {
        fill: var(--cab);
      }
      .glass {
        fill: var(--glass);
      }
      .chassis {
        fill: var(--chassis);
      }
      .light {
        fill: #fef9c3;
      }
      .fender {
        fill: none;
        stroke: var(--chassis);
        stroke-width: 5;
        stroke-linecap: round;
      }
      .tire {
        fill: var(--tire);
        stroke: var(--tire-stroke);
        stroke-width: 2;
      }
      .hub {
        fill: var(--hub);
      }
      .spoke {
        fill: none;
        stroke: var(--tire);
        stroke-width: 3;
        stroke-linecap: round;
      }
      .load {
        fill: var(--load);
      }
      .pebble {
        fill: var(--pebble);
      }
      .road {
        fill: none;
        stroke: var(--road);
        stroke-width: 3;
        stroke-dasharray: 14 10;
        opacity: 0.7;
      }

      .animated .truck {
        animation: bob 0.9s ease-in-out infinite;
      }

      .animated .spin {
        transform-box: fill-box;
        transform-origin: center;
        animation: spin 0.9s linear infinite;
      }

      .animated .road {
        animation: road 0.6s linear infinite;
      }

      @keyframes bob {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-1.5px);
        }
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes road {
        to {
          stroke-dashoffset: 24;
        }
      }
    `,
  ],
})
export class Logo {
  variant = input<'light' | 'dark'>('light');
  width = input(220);
  animated = input(false);
}