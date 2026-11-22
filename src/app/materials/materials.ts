import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api, Category, MaterialItem } from '../api';

@Component({
  selector: 'app-materials',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './materials.html',
})
export class Materials implements OnInit {
  private api = inject(Api);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  materials = signal<MaterialItem[]>([]);
  editingId = signal<number | null>(null);
  message = signal('');
  error = signal('');

  form = this.fb.nonNullable.group({
    category_id: [0, [Validators.required, Validators.min(1)]],
    name: ['', Validators.required],
    description: [''],
    unit: ['', Validators.required],
    unit_price: [0, [Validators.required, Validators.min(0)]],
    min_stock: [0, [Validators.required, Validators.min(0)]],
    current_stock: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.error.set('Cannot load categories. Is the backend running?'),
    });
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.api.getMaterials().subscribe({
      next: (data) => this.materials.set(data),
      error: () => this.error.set('Cannot load materials. Is the backend running?'),
    });
  }

  save(): void {
    this.message.set('');
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please complete all required fields.');
      return;
    }

    const data = this.form.getRawValue();
    const id = this.editingId();

    const request = id
      ? this.api.updateMaterial(id, data)
      : this.api.createMaterial(data);

    request.subscribe({
      next: () => {
        this.message.set(id ? 'Material updated.' : 'Material added.');
        this.resetForm();
        this.loadMaterials();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

  edit(m: MaterialItem): void {
    this.message.set('');
    this.error.set('');
    this.editingId.set(m.id);
    this.form.patchValue({
      category_id: m.category_id,
      name: m.name,
      description: m.description ?? '',
      unit: m.unit,
      unit_price: Number(m.unit_price),
      min_stock: Number(m.min_stock),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(m: MaterialItem): void {
    if (!confirm(`Delete "${m.name}"?`)) {
      return;
    }
    this.api.deleteMaterial(m.id).subscribe({
      next: () => {
        this.message.set('Material deleted.');
        this.loadMaterials();
      },
      error: () => this.error.set('Could not delete the material.'),
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      category_id: 0,
      name: '',
      description: '',
      unit: '',
      unit_price: 0,
      min_stock: 0,
      current_stock: 0,
    });
  }

  isLow(m: MaterialItem): boolean {
    return Number(m.current_stock) <= Number(m.min_stock);
  }

  value(m: MaterialItem): number {
    return Number(m.current_stock) * Number(m.unit_price);
  }
}