import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Author } from '../../models/author';
import { AuthorsStore } from '../../services/authors.store';
import { BooksStore } from '../../services/books.store';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { AuthorDialogComponent } from './author-dialog.component';

@Component({
  selector: 'app-authors-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './authors-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class AuthorsPageComponent {
  readonly authorsStore = inject(AuthorsStore);
  private readonly booksStore = inject(BooksStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(8);
  readonly sort = signal<Sort>({ active: 'name', direction: 'asc' });
  readonly displayedColumns = ['name', 'nationality', 'biography', 'books', 'actions'];

  readonly filteredAuthors = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.authorsStore
      .authors()
      .filter((author) =>
        !query
          ? true
          : [author.name, author.nationality, author.biography].some((value) =>
              value.toLowerCase().includes(query),
            ),
      );
  });

  readonly sortedAuthors = computed(() => {
    const { active, direction } = this.sort();
    if (!direction) return [...this.filteredAuthors()];
    return [...this.filteredAuthors()].sort((first, second) => {
      const comparison = this.sortValue(first, active).localeCompare(
        this.sortValue(second, active),
        'es',
        { numeric: true },
      );
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  readonly pagedAuthors = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedAuthors().slice(start, start + this.pageSize());
  });

  bookCount(authorId: number): number {
    return this.booksStore.books().filter((book) => book.authorId === authorId).length;
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  onSort(sort: Sort): void {
    this.sort.set(sort);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(AuthorDialogComponent, {
      width: 'min(92vw, 42rem)',
      maxWidth: '100vw',
      data: {},
    });
    ref.afterClosed().subscribe((author) => {
      if (author) {
        this.authorsStore.add(author);
        this.notify('Autor creado correctamente.');
      }
    });
  }

  openEditDialog(author: Author): void {
    const ref = this.dialog.open(AuthorDialogComponent, {
      width: 'min(92vw, 42rem)',
      maxWidth: '100vw',
      data: { author },
    });
    ref.afterClosed().subscribe((changes) => {
      if (changes) {
        this.authorsStore.update(author.id, changes);
        this.notify('Autor actualizado correctamente.');
      }
    });
  }

  confirmDelete(author: Author): void {
    const count = this.bookCount(author.id);
    if (count > 0) {
      this.notify(
        `No se puede eliminar: tiene ${count} libro${count === 1 ? '' : 's'} asociado${count === 1 ? '' : 's'}.`,
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: 'min(92vw, 28rem)',
      data: { title: 'Eliminar autor', message: `¿Quieres eliminar a «${author.name}»?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.authorsStore.remove(author.id);
        this.pageIndex.set(Math.min(this.pageIndex(), this.lastPageIndex()));
        this.notify('Autor eliminado correctamente.');
      }
    });
  }

  private lastPageIndex(): number {
    return Math.max(0, Math.ceil(this.filteredAuthors().length / this.pageSize()) - 1);
  }

  private sortValue(author: Author, property: string): string {
    if (property === 'books') return this.bookCount(author.id).toString();
    return String(author[property as keyof Author]);
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3500, horizontalPosition: 'end' });
  }
}
