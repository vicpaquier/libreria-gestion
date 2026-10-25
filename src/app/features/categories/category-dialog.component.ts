import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Categoria, CategoriaSolicitud } from '../../models/api';
@Component({
  selector: 'app-category-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.css',
})
export class CategoryDialogComponent {
  private readonly ref = inject(MatDialogRef<CategoryDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly data = inject<{ category?: Categoria }>(MAT_DIALOG_DATA);
  readonly isEditing = !!this.data.category;
  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.category?.nombre ?? '', Validators.required],
    descripcion: [this.data.category?.descripcion ?? ''],
  });
  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const result: CategoriaSolicitud = {
      nombre: value.nombre,
      descripcion: value.descripcion.trim() || null,
    };
    this.ref.close(result);
  }
}
