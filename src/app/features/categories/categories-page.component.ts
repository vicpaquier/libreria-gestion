import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Categoria } from '../../models/api';
import { CategoriesStore } from '../../services/categories.store';
import { errorMessage } from '../../services/http-error';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { CategoryDialogComponent } from './category-dialog.component';
@Component({
  selector: 'app-categories-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './categories-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class CategoriesPageComponent {
  readonly store = inject(CategoriesStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly columns = ['nombre', 'descripcion', 'acciones'];
  constructor() {
    this.store.load();
  }
  create(): void {
    this.open();
  }
  edit(category: Categoria): void {
    this.open(category);
  }
  remove(category: Categoria): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: { title: 'Eliminar categoría', message: `¿Eliminar ${category.nombre}?` },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok)
          this.store.remove(category.id).subscribe({
            next: () => this.notify('Categoría eliminada.'),
            error: (e) => this.notify(errorMessage(e, 'No se pudo eliminar.')),
          });
      });
  }
  private open(category?: Categoria): void {
    this.dialog
      .open(CategoryDialogComponent, { data: { category } })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;
        const request = category ? this.store.update(category.id, value) : this.store.add(value);
        request.subscribe({
          next: () => this.notify(category ? 'Categoría actualizada.' : 'Categoría creada.'),
          error: (e) => this.notify(errorMessage(e, 'No se pudo guardar.')),
        });
      });
  }
  private notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 3500 });
  }
}
