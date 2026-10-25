import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Autor, AutorSolicitud } from '../../models/api';
@Component({
  selector: 'app-author-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './author-dialog.component.html',
  styleUrl: './author-dialog.component.css',
})
export class AuthorDialogComponent {
  private readonly ref = inject(MatDialogRef<AuthorDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly data = inject<{ author?: Autor }>(MAT_DIALOG_DATA);
  readonly isEditing = !!this.data.author;
  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.author?.nombre ?? '', Validators.required],
    apellido: [this.data.author?.apellido ?? '', Validators.required],
    nacionalidad: [this.data.author?.nacionalidad ?? ''],
  });
  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    const result: AutorSolicitud = { ...value, nacionalidad: value.nacionalidad.trim() || null };
    this.ref.close(result);
  }
}
