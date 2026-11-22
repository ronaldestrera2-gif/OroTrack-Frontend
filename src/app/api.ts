import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

export interface MaterialItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  unit: string;
  unit_price: string;
  min_stock: string;
  current_stock: string;
  category?: Category;
}

export interface MaterialForm {
  category_id: number;
  name: string;
  description: string;
  unit: string;
  unit_price: number;
  min_stock: number;
  current_stock: number;
}

export interface TransactionItem {
  id: number;
  material_id: number;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity: string;
  unit_price: string;
  balance_after: string;
  party_name: string | null;
  remarks: string | null;
  transaction_date: string;
  material?: MaterialItem;
}

export interface TransactionForm {
  material_id: number;
  type: string;
  quantity: number;
  transaction_date: string;
  party_name: string;
  remarks: string;
}

export interface CategorySummary {
  category: string;
  materials: number;
  value: number;
}

export interface DashboardData {
  total_materials: number;
  total_inventory_value: number;
  low_stock_count: number;
  low_stock: MaterialItem[];
  by_category: CategorySummary[];
  recent_transactions: TransactionItem[];
}

export interface InventoryReportItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  unit_price: number;
  current_stock: number;
  min_stock: number;
  value: number;
  status: string;
}

export interface InventoryReport {
  generated_at: string;
  total_value: number;
  items: InventoryReportItem[];
}

export interface TransactionReportItem {
  id: number;
  date: string;
  material: string;
  category: string;
  unit: string;
  type: string;
  quantity: number;
  balance_after: number;
  party_name: string | null;
  remarks: string | null;
}

export interface TransactionReport {
  generated_at: string;
  from: string | null;
  to: string | null;
  count: number;
  items: TransactionReportItem[];
}

export interface ReportFilters {
  from: string;
  to: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api';

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`);
  }

  getInventoryReport(): Observable<InventoryReport> {
    return this.http.get<InventoryReport>(`${this.baseUrl}/reports/inventory`);
  }

  getTransactionReport(filters: ReportFilters): Observable<TransactionReport> {
    let params = new HttpParams();
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.type) params = params.set('type', filters.type);

    return this.http.get<TransactionReport>(`${this.baseUrl}/reports/transactions`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getMaterials(): Observable<MaterialItem[]> {
    return this.http.get<MaterialItem[]>(`${this.baseUrl}/materials`);
  }

  createMaterial(data: MaterialForm): Observable<MaterialItem> {
    return this.http.post<MaterialItem>(`${this.baseUrl}/materials`, data);
  }

  updateMaterial(id: number, data: MaterialForm): Observable<MaterialItem> {
    return this.http.put<MaterialItem>(`${this.baseUrl}/materials/${id}`, data);
  }

  deleteMaterial(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/materials/${id}`);
  }

  getTransactions(): Observable<TransactionItem[]> {
    return this.http.get<TransactionItem[]>(`${this.baseUrl}/transactions`);
  }

  createTransaction(data: TransactionForm): Observable<TransactionItem> {
    return this.http.post<TransactionItem>(`${this.baseUrl}/transactions`, data);
  }
}