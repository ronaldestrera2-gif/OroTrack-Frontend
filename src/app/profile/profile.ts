import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  auth = inject(Auth);

  name = signal(this.auth.user()?.name ?? '');
  newPhoto = signal<string | null>(null);
  removePhoto = signal(false);
  saving = signal(false);
  message = signal('');
  error = signal('');

  previewPhoto = computed(() => {
    if (this.removePhoto()) return null;
    return this.newPhoto() ?? this.auth.user()?.profile_photo ?? null;
  });

  initial = computed(() => (this.name() || '?').charAt(0).toUpperCase());

  roleLabel = computed(() => {
    switch (this.auth.user()?.role) {
      case 'admin':
        return 'Administrator';
      case 'inventory':
        return 'Inventory Staff';
      case 'management':
        return 'Management';
      default:
        return '';
    }
  });

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.message.set('');
    this.error.set('');

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please choose an image file (JPG, PNG or WEBP).');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Shrink to a 256x256 square so it stays small in the database
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.error.set('Could not read the image.');
          return;
        }
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        this.newPhoto.set(canvas.toDataURL('image/jpeg', 0.85));
        this.removePhoto.set(false);
      };
      img.onerror = () => this.error.set('Could not read the image.');
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearPhoto(): void {
    this.newPhoto.set(null);
    this.removePhoto.set(true);
    this.message.set('');
    this.error.set('');
  }

  save(): void {
    this.message.set('');
    this.error.set('');

    const name = this.name().trim();
    if (!name) {
      this.error.set('Please enter your name.');
      return;
    }

    this.saving.set(true);
    this.auth.updateProfile(name, this.newPhoto(), this.removePhoto()).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.newPhoto.set(null);
        this.removePhoto.set(false);
        this.name.set(res.user.name);
        this.message.set('Profile saved.');
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Could not save your profile. Please try again.');
      },
    });
  }
}