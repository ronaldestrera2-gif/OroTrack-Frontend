import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api, DashboardData } from '../api';
import { Auth } from '../auth';
import { Icon } from '../icon/icon';
import { Logo } from '../logo/logo';

interface StockLevel {
  id: number;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
}

interface DayActivity {
  date: string;
  label: string;
  stock_in: number;
  stock_out: number;
}

interface SalesItem {
  label: string;
  value: number;
}

interface SalesSummary {
  total: number;
  by_category: SalesItem[];
  by_material: SalesItem[];
}

interface Slice {
  label: string;
  value: number;
  percent: number;
  color: string;
  path: string;
  full: boolean;
  dx: number;
  dy: number;
}

interface DashboardView extends DashboardData {
  stock_levels: StockLevel[];
  activity: DayActivity[];
  transactions_this_month: number;
  sales_month_label: string;
  sales: { month: SalesSummary; all: SalesSummary };
}

const CX = 100;
const CY = 100;
const R = 88;

const CATEGORY_COLORS: Record<string, string> = {
  Soil: '#92400e',
  Sand: '#f59e0b',
  Gravel: '#9ca3af',
  'Crushed Rock': '#374151',
};

const PALETTE = [
  '#92400e',
  '#f59e0b',
  '#0d9488',
  '#6366f1',
  '#ef4444',
  '#84cc16',
  '#0ea5e9',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink, Logo, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private api = inject(Api);
  auth = inject(Auth);

  data = signal<DashboardView | null>(null);
  error = signal('');

  salesPeriod = signal<'month' | 'all'>('month');
  salesView = signal<'category' | 'material'>('category');
  hovered = signal<number | null>(null);

  today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  maxCategoryValue = computed(() => {
    const values = this.data()?.by_category.map((c) => c.value) ?? [0];
    return Math.max(1, ...values);
  });

  maxActivity = computed(() => {
    const counts = this.data()?.activity.flatMap((a) => [a.stock_in, a.stock_out]) ?? [0];
    return Math.max(1, ...counts);
  });

  // ---------- Sales pie chart ----------

  salesTotal = computed(() => this.data()?.sales?.[this.salesPeriod()]?.total ?? 0);

  slices = computed<Slice[]>(() => {
    const summary = this.data()?.sales?.[this.salesPeriod()];

    if (!summary) {
      return [];
    }

    const byCategory = this.salesView() === 'category';
    const items = (byCategory ? summary.by_category : summary.by_material).filter(
      (item) => item.value > 0,
    );
    const total = items.reduce((sum, item) => sum + item.value, 0);

    if (total <= 0) {
      return [];
    }

    let start = -Math.PI / 2;

    return items.map((item, index) => {
      const fraction = item.value / total;
      const end = start + fraction * Math.PI * 2;
      const mid = (start + end) / 2;

      const x1 = CX + R * Math.cos(start);
      const y1 = CY + R * Math.sin(start);
      const x2 = CX + R * Math.cos(end);
      const y2 = CY + R * Math.sin(end);
      const large = fraction > 0.5 ? 1 : 0;

      const slice: Slice = {
        label: item.label,
        value: item.value,
        percent: Math.round(fraction * 1000) / 10,
        color: (byCategory ? CATEGORY_COLORS[item.label] : undefined) ?? PALETTE[index % PALETTE.length],
        path: `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`,
        full: fraction >= 0.9999,
        dx: Math.round(Math.cos(mid) * 7 * 100) / 100,
        dy: Math.round(Math.sin(mid) * 7 * 100) / 100,
      };

      start = end;
      return slice;
    });
  });

  activeSlice = computed(() => {
    const index = this.hovered();
    return index === null ? null : (this.slices()[index] ?? null);
  });

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => this.data.set(d as DashboardView),
      error: () => this.error.set('Cannot load the dashboard. Is the backend running?'),
    });
  }

  setPeriod(period: 'month' | 'all'): void {
    this.salesPeriod.set(period);
    this.hovered.set(null);
  }

  setView(view: 'category' | 'material'): void {
    this.salesView.set(view);
    this.hovered.set(null);
  }

  hover(index: number | null): void {
    this.hovered.set(index);
  }

  categoryPercent(value: number): number {
    return (value / this.maxCategoryValue()) * 100;
  }

  stockPercent(s: StockLevel): number {
    if (s.min_stock <= 0) {
      return s.current_stock > 0 ? 100 : 0;
    }
    return Math.min(100, (s.current_stock / (s.min_stock * 3)) * 100);
  }

  stockStatus(s: StockLevel): 'low' | 'watch' | 'good' {
    if (s.current_stock <= s.min_stock) return 'low';
    if (s.current_stock <= s.min_stock * 1.5) return 'watch';
    return 'good';
  }

  barHeight(count: number): number {
    return (count / this.maxActivity()) * 100;
  }

  label(type: string): string {
    if (type === 'stock_in') return 'Stock In';
    if (type === 'stock_out') return 'Stock Out';
    return 'Adjustment';
  }
}