import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, Logo],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements AfterViewInit, OnDestroy {
  auth = inject(Auth);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  private observer?: IntersectionObserver;

  scrolled = signal(false);
  year = new Date().getFullYear();
  dust = Array.from({ length: 14 }, (_, i) => i);

  features = [
    {
      icon: '📦',
      title: 'Material Management',
      text: 'Record soil, sand, gravel, and crushed rock with their units, prices, and minimum stock levels.',
    },
    {
      icon: '🔄',
      title: 'Stock In and Stock Out',
      text: 'Log deliveries and releases. Balances update automatically and over-releasing is blocked.',
    },
    {
      icon: '⚠️',
      title: 'Low-Stock Alerts',
      text: 'See at a glance which materials have reached their minimum level and need replenishment.',
    },
    {
      icon: '🧾',
      title: 'Transaction History',
      text: 'Every movement is saved with its date, quantity, balance, and supplier or customer.',
    },
    {
      icon: '📊',
      title: 'Valuation Reports',
      text: 'Generate inventory valuation and transaction reports, then print them or save them as PDF.',
    },
    {
      icon: '🔐',
      title: 'Role-Based Access',
      text: 'Admins, inventory staff, and management each see only the pages they need.',
    },
  ];

  steps = [
    {
      title: 'Record your materials',
      text: 'Add each material with its category, unit, price, and minimum stock level.',
    },
    {
      title: 'Log every movement',
      text: 'Record stock-in deliveries and stock-out releases as they happen.',
    },
    {
      title: 'Monitor and report',
      text: 'Watch the dashboard, respond to low-stock alerts, and print reports for management.',
    },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  ngAfterViewInit(): void {
    const targets = this.host.nativeElement.querySelectorAll('.reveal');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          entry.target.classList.add('visible');
          this.observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );

    targets.forEach((el) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}