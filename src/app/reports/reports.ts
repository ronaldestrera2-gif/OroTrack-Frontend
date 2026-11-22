import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Api, InventoryReport, TransactionReport } from '../api';

@Component({
  selector: 'app-reports',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './reports.html',
  styles: [
    `
      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .btn.active {
        background: #92400e;
        border-color: #92400e;
        color: #fff;
      }
      .filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        align-items: end;
        margin-bottom: 16px;
      }
      .report-head {
        text-align: center;
        margin-bottom: 16px;
      }
      .report-head h2 {
        margin: 0 0 4px;
      }
      .report-head p {
        margin: 2px 0;
        font-size: 14px;
        color: #4b5563;
      }
      tfoot td {
        font-weight: bold;
        border-top: 2px solid #1f2937;
      }
      .badge.adj {
        background: #fef3c7;
        color: #92400e;
      }
    `,
  ],
})
export class Reports implements OnInit {
  private api = inject(Api);
  private fb = inject(FormBuilder);

  view = signal<'inventory' | 'transactions'>('inventory');
  inventory = signal<InventoryReport | null>(null);
  transactions = signal<TransactionReport | null>(null);
  error = signal('');

  filters = this.fb.nonNullable.group({
    from: [''],
    to: [''],
    type: [''],
  });

  ngOnInit(): void {
    this.loadInventory();
    this.loadTransactions();
  }

  setView(v: 'inventory' | 'transactions'): void {
    this.view.set(v);
  }

  loadInventory(): void {
    this.api.getInventoryReport().subscribe({
      next: (data) => this.inventory.set(data),
      error: () => this.error.set('Cannot load the report. Is the backend running?'),
    });
  }

  loadTransactions(): void {
    this.error.set('');
    this.api.getTransactionReport(this.filters.getRawValue()).subscribe({
      next: (data) => this.transactions.set(data),
      error: (err) =>
        this.error.set(err?.error?.message ?? 'Cannot load the report. Is the backend running?'),
    });
  }

  clearFilters(): void {
    this.filters.reset({ from: '', to: '', type: '' });
    this.loadTransactions();
  }

  print(): void {
    window.print();
  }

  label(type: string): string {
    if (type === 'stock_in') return 'Stock In';
    if (type === 'stock_out') return 'Stock Out';
    return 'Adjustment';
  }
}