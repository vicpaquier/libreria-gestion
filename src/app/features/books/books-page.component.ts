import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { Libro, LibroDetalle } from '../../models/api';
import { AuthorsStore } from '../../services/authors.store';
import { BooksStore } from '../../services/books.store';
import { CategoriesStore } from '../../services/categories.store';
import { EditorialsStore } from '../../services/editorials.store';
import { errorMessage } from '../../services/http-error';
import { BookDialogComponent } from './book-dialog.component';
@Component({
  selector: 'app-books-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './books-page.component.html',
  styleUrl: './books-page.component.css',
})
export class BooksPageComponent {
  readonly store = inject(BooksStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  readonly authors = inject(AuthorsStore);
  readonly categories = inject(CategoriesStore);
  readonly editorials = inject(EditorialsStore);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly pending = signal(false);
  readonly filtersForm = this.fb.group({
    buscar: [''],
    autorId: [null as number | null],
    categoriaId: [null as number | null],
    editorialId: [null as number | null],
    anio: [null as number | null],
    disponible: [null as boolean | null],
  });
  readonly columns = ['titulo', 'autores', 'categorias', 'editorial', 'stock', 'acciones'];
  constructor() {
    this.authors.load();
    this.categories.load();
    this.editorials.load();
    this.load();
  }
  load(): void {
    const filters = this.filtersForm.getRawValue();
    this.store.load(this.page(), this.size(), {
      buscar: filters.buscar || undefined,
      autorId: filters.autorId ?? undefined,
      categoriaId: filters.categoriaId ?? undefined,
      editorialId: filters.editorialId ?? undefined,
      anio: filters.anio ?? undefined,
      disponible: filters.disponible ?? undefined,
    });
  }
  applyFilters(): void {
    this.page.set(0);
    this.load();
  }
  changePage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.size.set(e.pageSize);
    this.load();
  }
  create(): void {
    this.open();
  }
  detail(book: Libro): void {
    this.store.get(book.id).subscribe({
      next: (data) => this.dialog.open(BookDetailDialog, { data, width: 'min(92vw, 52rem)' }),
      error: (error) => this.notify(errorMessage(error, 'No se pudo cargar el detalle del libro.')),
    });
  }
  edit(book: Libro): void {
    this.open(book);
  }
  stock(book: Libro): void {
    const control = new FormControl(book.cantidadTotal, {
      nonNullable: true,
      validators: [Validators.min(0)],
    });
    this.dialog
      .open(StockDialog, { data: { book, control } })
      .afterClosed()
      .subscribe((cantidad) => {
        if (cantidad !== undefined && !this.pending()) {
          this.pending.set(true);
          this.store
            .adjustStock(book.id, Number(cantidad))
            .pipe(finalize(() => this.pending.set(false)))
            .subscribe({
              next: () => this.notify('Stock actualizado.'),
              error: (e) => this.notify(errorMessage(e, 'No se pudo ajustar el stock.')),
            });
        }
      });
  }
  private open(book?: Libro): void {
    this.dialog
      .open(BookDialogComponent, { data: { book }, width: 'min(92vw,46rem)' })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;
        if (this.pending()) return;
        const request = book
          ? this.store.update(book.id, value)
          : this.store.add({ ...value, cantidadTotal: value.cantidadTotal ?? 0 });
        this.pending.set(true);
        request.pipe(finalize(() => this.pending.set(false))).subscribe({
          next: () => this.notify(book ? 'Libro actualizado.' : 'Libro creado.'),
          error: (e) => this.notify(errorMessage(e, 'No se pudo guardar el libro.')),
        });
      });
  }
  private notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 3500 });
  }
}
@Component({
  selector: 'app-stock-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template:
    '<h2 mat-dialog-title>Ajustar stock</h2><mat-dialog-content><p>{{data.book.titulo}}: {{data.book.cantidadDisponible}} disponibles</p><mat-form-field appearance="outline"><mat-label>Cantidad total</mat-label><input matInput type="number" min="0" [formControl]="data.control" /></mat-form-field></mat-dialog-content><mat-dialog-actions align="end"><button matButton mat-dialog-close>Cancelar</button><button matButton="filled" [mat-dialog-close]="data.control.value" [disabled]="data.control.invalid">Guardar</button></mat-dialog-actions>',
})
export class StockDialog {
  readonly data = inject<{ book: Libro; control: FormControl<number> }>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-book-detail-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template:
    '<h2 mat-dialog-title>{{data.titulo}}</h2><mat-dialog-content><p>Stock: {{data.cantidadDisponible}} / {{data.cantidadTotal}}</p><p>Préstamos activos: {{data.prestamosActivos.length}}</p><p>Reservas pendientes: {{data.reservasPendientes.length}}</p></mat-dialog-content><mat-dialog-actions align="end"><button matButton mat-dialog-close>Cerrar</button></mat-dialog-actions>',
})
export class BookDetailDialog {
  readonly data = inject<LibroDetalle>(MAT_DIALOG_DATA);
}
