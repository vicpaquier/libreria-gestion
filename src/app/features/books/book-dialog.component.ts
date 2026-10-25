import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Libro, LibroSolicitud } from '../../models/api';
import { AuthorsStore } from '../../services/authors.store';
import { CategoriesStore } from '../../services/categories.store';
import { EditorialsStore } from '../../services/editorials.store';

@Component({
  selector: 'app-book-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './book-dialog.component.html',
  styleUrl: './book-dialog.component.css',
})
export class BookDialogComponent {
  private readonly ref = inject(MatDialogRef<BookDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly authors = inject(AuthorsStore);
  readonly categories = inject(CategoriesStore);
  readonly editorials = inject(EditorialsStore);
  readonly data = inject<{ book?: Libro }>(MAT_DIALOG_DATA);
  readonly isEditing = !!this.data.book;
  readonly form = this.fb.nonNullable.group({
    titulo: [this.data.book?.titulo ?? '', Validators.required],
    isbn: [this.data.book?.isbn ?? ''],
    anioPublicacion: [this.data.book?.anioPublicacion ?? (null as number | null)],
    numeroPaginas: [this.data.book?.numeroPaginas ?? (null as number | null), Validators.min(1)],
    cantidadTotal: [this.data.book?.cantidadTotal ?? 0, [Validators.required, Validators.min(0)]],
    editorialId: [this.data.book?.editorial?.id ?? (null as number | null)],
    autoresIds: [this.data.book?.autores.map((a) => a.id) ?? [], Validators.required],
    categoriasIds: [this.data.book?.categorias.map((c) => c.id) ?? [], Validators.required],
  });
  readonly submitted = signal(false);
  constructor() {
    this.authors.load();
    this.categories.load();
    this.editorials.load();
  }
  submit(): void {
    if (this.submitted()) return;
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.submitted.set(true);
    const v = this.form.getRawValue();
    const result: LibroSolicitud = {
      titulo: v.titulo,
      isbn: v.isbn.trim() || null,
      anioPublicacion: v.anioPublicacion ? Number(v.anioPublicacion) : null,
      numeroPaginas: v.numeroPaginas ? Number(v.numeroPaginas) : null,
      cantidadTotal: Number(v.cantidadTotal),
      editorialId: v.editorialId ? Number(v.editorialId) : null,
      autoresIds: v.autoresIds.map(Number),
      categoriasIds: v.categoriasIds.map(Number),
    };
    this.ref.close(result);
  }
}
