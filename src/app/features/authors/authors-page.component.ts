import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Autor } from '../../models/api';
import { AuthorsStore } from '../../services/authors.store';
import { errorMessage } from '../../services/http-error';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { AuthorDialogComponent } from './author-dialog.component';
@Component({
  selector: 'app-authors-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './authors-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class AuthorsPageComponent {
  readonly store = inject(AuthorsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly columns = ['nombre', 'nacionalidad', 'acciones'];
  constructor() {
    this.store.load();
  }
  search(event: Event): void {
    this.store.load((event.target as HTMLInputElement).value);
  }
  create(): void {
    this.dialog
      .open(AuthorDialogComponent, { data: {}, width: 'min(92vw, 42rem)' })
      .afterClosed()
      .subscribe((value) => {
        if (value)
          this.store.add(value).subscribe({
            next: () => this.notify('Autor creado.'),
            error: (e) => this.notify(errorMessage(e, 'No se pudo crear el autor.')),
          });
      });
  }
  edit(author: Autor): void {
    this.dialog
      .open(AuthorDialogComponent, { data: { author }, width: 'min(92vw, 42rem)' })
      .afterClosed()
      .subscribe((value) => {
        if (value)
          this.store.update(author.id, value).subscribe({
            next: () => this.notify('Autor actualizado.'),
            error: (e) => this.notify(errorMessage(e, 'No se pudo actualizar el autor.')),
          });
      });
  }
  remove(author: Autor): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar autor',
          message: `¿Eliminar a ${author.nombre} ${author.apellido}?`,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok)
          this.store.remove(author.id).subscribe({
            next: () => this.notify('Autor eliminado.'),
            error: (e) => this.notify(errorMessage(e, 'No se pudo eliminar el autor.')),
          });
      });
  }
  private notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 3500 });
  }
}
