import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api, MaterialItem, TransactionForm, TransactionItem } from '../api';

type TabKey = 'stock_in' | 'stock_out' | 'adjustment';
type SortKey = 'datetime' | 'material' | 'quantity' | 'balance' | 'party' | 'type';
type TxRow = TransactionItem & { created_at?: string };

interface FieldErrors {
  material?: string;
  quantity?: string;
  date?: string;
}

interface Pending {
  payload: TransactionForm;
  material: MaterialItem;
  qty: number;
  before: number;
  after: number;
  lowWarning: boolean;
}

@Component({
  selector: 'app-transactions',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  private api = inject(Api);
  private fb = inject(FormBuilder);

  tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'stock_in', label: 'Stock In', icon: '📥' },
    { key: 'stock_out', label: 'Stock Out', icon: '📤' },
    { key: 'adjustment', label: 'Adjustment', icon: '⚖️' },
  ];

  private presetSorts = [
    'datetime:desc',
    'datetime:asc',
    'type:stock_in',
    'type:stock_out',
    'material:asc',
    'quantity:desc',
    'quantity:asc',
  ];

  materials = signal<MaterialItem[]>([]);
  transactions = signal<TxRow[]>([]);
  message = signal('');
  error = signal('');

  // Validation and confirmation
  submitted = signal(false);
  pending = signal<Pending | null>(null);
  saving = signal(false);
  maxDate = this.today();

  activeTab = signal<TabKey>('stock_in');
  showAll = signal(false);
  sortKey = signal<SortKey>('datetime');
  sortDir = signal<'asc' | 'desc'>('desc');
  typeFirst = signal<'stock_in' | 'stock_out'>('stock_in');

  sortChoice = computed(() =>
    this.sortKey() === 'type'
      ? `type:${this.typeFirst()}`
      : `${this.sortKey()}:${this.sortDir()}`,
  );
  isCustomSort = computed(() => !this.presetSorts.includes(this.sortChoice()));

  form = this.fb.nonNullable.group({
    material_id: [0, [Validators.required, Validators.min(1)]],
    type: ['stock_in', Validators.required],
    quantity: [0, Validators.required],
    transaction_date: [this.today(), Validators.required],
    party_name: [''],
    remarks: [''],
  });

  // History rows: filtered by the active tab (unless "Show all types") and sorted
  visible = computed(() => {
    const tab = this.activeTab();
    const key = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;

    const rows = this.showAll()
      ? [...this.transactions()]
      : this.transactions().filter((t) => t.type === tab);

    // Newest first: date, then the time the record was saved
    const newestFirst = (a: TxRow, b: TxRow): number =>
      b.transaction_date.localeCompare(a.transaction_date) ||
      (b.created_at ?? '').localeCompare(a.created_at ?? '') ||
      b.id - a.id;

    if (key === 'type') {
      const first = this.typeFirst();
      const order: string[] = [
        first,
        ...(['stock_in', 'stock_out', 'adjustment'] as string[]).filter((x) => x !== first),
      ];

      return rows.sort(
        (a, b) => order.indexOf(a.type) - order.indexOf(b.type) || newestFirst(a, b),
      );
    }

    return rows.sort((a, b) => {
      let result = 0;

      switch (key) {
        case 'datetime':
          result =
            a.transaction_date.localeCompare(b.transaction_date) ||
            (a.created_at ?? '').localeCompare(b.created_at ?? '');
          break;
        case 'material':
          result = (a.material?.name ?? '').localeCompare(b.material?.name ?? '');
          break;
        case 'quantity':
          result = Number(a.quantity) - Number(b.quantity);
          break;
        case 'balance':
          result = Number(a.balance_after) - Number(b.balance_after);
          break;
        case 'party':
          result = (a.party_name ?? '').localeCompare(b.party_name ?? '');
          break;
      }

      if (result === 0) {
        result = a.id - b.id;
      }

      return result * dir;
    });
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.api.getMaterials().subscribe({
      next: (data) => this.materials.set(data),
      error: () => this.error.set('Cannot load materials. Is the backend running?'),
    });
    this.api.getTransactions().subscribe({
      next: (data) => this.transactions.set(data as TxRow[]),
      error: () => this.error.set('Cannot load transactions. Is the backend running?'),
    });
  }

  selectTab(tab: TabKey): void {
    this.activeTab.set(tab);
    this.form.controls.type.setValue(tab);
    this.submitted.set(false);
    this.message.set('');
    this.error.set('');
  }

  toggleShowAll(): void {
    this.showAll.update((v) => !v);
  }

  count(type: TabKey): number {
    return this.transactions().filter((t) => t.type === type).length;
  }

  // ---------- Sorting ----------

  setSort(key: SortKey): void {
    if (key === 'type') {
      if (this.sortKey() === 'type') {
        this.typeFirst.update((t) => (t === 'stock_in' ? 'stock_out' : 'stock_in'));
      } else {
        this.sortKey.set('type');
        this.typeFirst.set('stock_in');
      }
      return;
    }

    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set(key === 'datetime' ? 'desc' : 'asc');
    }
  }

  applySort(value: string): void {
    if (value === 'custom') {
      return;
    }

    const [key, rest] = value.split(':');

    if (key === 'type') {
      this.sortKey.set('type');
      this.typeFirst.set(rest as 'stock_in' | 'stock_out');
      this.showAll.set(true); // so the grouping by type is visible
      return;
    }

    this.sortKey.set(key as SortKey);
    this.sortDir.set(rest as 'asc' | 'desc');
  }

  arrow(key: SortKey): string {
    if (this.sortKey() !== key) return '↕';
    if (key === 'type') return this.typeFirst() === 'stock_in' ? '▲ In' : '▼ Out';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }

  timeOf(t: TxRow): string {
    if (!t.created_at) {
      return '';
    }
    return new Date(t.created_at).toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    });
  }

  // ---------- Validation ----------

  selected(): MaterialItem | undefined {
    return this.materials().find((m) => m.id === this.form.controls.material_id.value);
  }

  errors(): FieldErrors {
    const out: FieldErrors = {};
    const v = this.form.getRawValue();
    const type = this.activeTab();
    const m = this.selected();
    const qty = Number(v.quantity);

    if (!m) {
      out.material = 'Please select a material.';
    }

    if (!qty) {
      out.quantity =
        type === 'adjustment'
          ? 'Enter a quantity. Use a negative number to reduce the stock.'
          : 'Enter a quantity greater than zero.';
    } else if (type !== 'adjustment' && qty < 0) {
      out.quantity = 'Quantity must be greater than zero.';
    } else if (Math.abs(qty * 100 - Math.round(qty * 100)) > 1e-6) {
      out.quantity = 'Use at most 2 decimal places.';
    } else if (Math.abs(qty) > 9999999) {
      out.quantity = 'That quantity is too large.';
    } else if (m) {
      const available = Number(m.current_stock);

      if (type === 'stock_out' && qty > available) {
        out.quantity = `Not enough stock. Available: ${this.fmt(available)} ${m.unit}.`;
      } else if (type === 'adjustment' && available + qty < 0) {
        out.quantity = `This would make the stock negative. Available: ${this.fmt(available)} ${m.unit}.`;
      }
    }

    if (!v.transaction_date) {
      out.date = 'Please select a date.';
    } else if (v.transaction_date > this.today()) {
      out.date = 'The date cannot be in the future.';
    }

    return out;
  }

  showErr(field: 'material_id' | 'quantity' | 'transaction_date'): boolean {
    return this.submitted() || this.form.controls[field].touched;
  }

  // ---------- Save with confirmation ----------

  requestSave(): void {
    this.message.set('');
    this.error.set('');
    this.submitted.set(true);

    const m = this.selected();

    if (Object.keys(this.errors()).length > 0 || !m) {
      this.error.set('Please fix the highlighted fields before saving.');
      return;
    }

    const data = this.form.getRawValue();
    const qty = Number(data.quantity);
    const before = Number(m.current_stock);
    const after = this.round2(data.type === 'stock_out' ? before - qty : before + qty);

    this.pending.set({
      payload: { ...data, quantity: qty },
      material: m,
      qty,
      before,
      after,
      lowWarning: after <= Number(m.min_stock),
    });
  }

  confirmSave(): void {
    const p = this.pending();

    if (!p || this.saving()) {
      return;
    }

    this.saving.set(true);

    this.api.createTransaction(p.payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.pending.set(null);
        this.message.set(
          `${this.label(p.payload.type)} of ${this.fmt(p.qty)} ${p.material.unit} recorded for ` +
            `${p.material.name}. New balance: ${this.fmt(p.after)} ${p.material.unit}.`,
        );
        this.resetForm();
        this.loadAll();
      },
      error: (err) => {
        this.saving.set(false);
        this.pending.set(null);
        this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
        this.loadAll();
      },
    });
  }

  cancelConfirm(): void {
    if (!this.saving()) {
      this.pending.set(null);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelConfirm();
  }

  resetForm(): void {
    this.submitted.set(false);
    this.form.reset({
      material_id: 0,
      type: this.activeTab(),
      quantity: 0,
      transaction_date: this.today(),
      party_name: '',
      remarks: '',
    });
  }

  // ---------- Text helpers ----------

  heading(): string {
    const tab = this.activeTab();
    if (tab === 'stock_in') return 'Record Stock In';
    if (tab === 'stock_out') return 'Record Stock Out';
    return 'Record Adjustment';
  }

  description(): string {
    const tab = this.activeTab();
    if (tab === 'stock_in') return 'Record a delivery. The quantity is added to the stock.';
    if (tab === 'stock_out') return 'Record a release. The quantity is deducted from the stock.';
    return 'Correct the stock after a count. Use a negative number to reduce the stock.';
  }

  partyLabel(): string {
    const tab = this.activeTab();
    if (tab === 'stock_in') return 'Supplier';
    if (tab === 'stock_out') return 'Customer';
    return 'Reference';
  }

  emptyText(): string {
    const tab = this.activeTab();
    if (this.showAll()) return 'No transactions yet.';
    if (tab === 'stock_in') return 'No stock-in records yet.';
    if (tab === 'stock_out') return 'No stock-out records yet.';
    return 'No adjustments yet.';
  }

  activeIcon(): string {
    return this.tabs.find((t) => t.key === this.activeTab())?.icon ?? '';
  }

  label(type: string): string {
    if (type === 'stock_in') return 'Stock In';
    if (type === 'stock_out') return 'Stock Out';
    return 'Adjustment';
  }

  private fmt(n: number): string {
    return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private today(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}