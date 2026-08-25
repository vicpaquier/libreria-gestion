import { CurrencyPipe } from '@angular/common';
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
import { Book } from '../../models/book';
import { AuthorsStore } from '../../services/authors.store';
import { BooksStore } from '../../services/books.store';
import { CategoriesStore } from '../../services/categories.store';
import { LoansStore } from '../../services/loans.store';
import { BookDialogComponent } from './book-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-books-page',
  imports: [
    CurrencyPipe,
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
  templateUrl: './books-page.component.html',
  styleUrl: './books-page.component.css',
})
export class BooksPageComponent {
  readonly booksStore = inject(BooksStore);
  private readonly authorsStore = inject(AuthorsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly loansStore = inject(LoansStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(8);
  readonly sort = signal<Sort>({ active: 'title', direction: 'asc' });
  readonly displayedColumns = [
    'title',
    'author',
    'category',
    'price',
    'stock',
    'status',
    'actions',
  ];
  private readonly authorNames = computed(
    () => new Map(this.authorsStore.authors().map((author) => [author.id, author.name])),
  );
  private readonly categoryNames = computed(
    () =>
      new Map(this.categoriesStore.categories().map((category) => [category.id, category.name])),
  );

  readonly filteredBooks = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.booksStore.books();
    }

    return this.booksStore
      .books()
      .filter((book) =>
        [
          book.title,
          this.authorName(book.authorId),
          book.isbn,
          this.categoryName(book.categoryId),
        ].some((value) => value.toLowerCase().includes(query)),
      );
  });

  readonly sortedBooks = computed(() => {
    const { active, direction } = this.sort();
    const books = [...this.filteredBooks()];
    if (!direction) {
      return books;
    }

    return books.sort((first, second) => {
      const firstValue = this.sortValue(first, active);
      const secondValue = this.sortValue(second, active);
      const comparison = firstValue.localeCompare(secondValue, 'es', { numeric: true });
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  readonly pagedBooks = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedBooks().slice(start, start + this.pageSize());
  });

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  authorName(id: number): string {
    return this.authorNames().get(id) ?? 'Sin autor';
  }

  categoryName(id: number): string {
    return this.categoryNames().get(id) ?? 'Sin categoría';
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
    const dialogRef = this.dialog.open(BookDialogComponent, {
      width: 'min(92vw, 42rem)',
      maxWidth: '100vw',
      data: {},
    });

    dialogRef.afterClosed().subscribe((book) => {
      if (book) {
        this.booksStore.add(book);
        this.showNotification('Libro creado correctamente.');
      }
    });
  }

  openEditDialog(book: Book): void {
    const dialogRef = this.dialog.open(BookDialogComponent, {
      width: 'min(92vw, 42rem)',
      maxWidth: '100vw',
      data: { book },
    });

    dialogRef.afterClosed().subscribe((changes) => {
      if (changes) {
        this.booksStore.update(book.id, changes);
        this.showNotification('Libro actualizado correctamente.');
      }
    });
  }

  confirmDelete(book: Book): void {
    if (this.loansStore.hasBookHistory(book.id)) {
      this.showNotification('No se puede eliminar: el libro tiene historial de préstamos.');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'min(92vw, 28rem)',
      maxWidth: '100vw',
      data: {
        title: 'Eliminar libro',
        message: `¿Quieres eliminar «${book.title}»? Esta acción no se puede deshacer.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.booksStore.remove(book.id);
        this.pageIndex.set(Math.min(this.pageIndex(), this.lastPageIndex()));
        this.showNotification('Libro eliminado correctamente.');
      }
    });
  }

  private lastPageIndex(): number {
    return Math.max(0, Math.ceil(this.filteredBooks().length / this.pageSize()) - 1);
  }

  private sortValue(book: Book, property: string): string {
    if (property === 'author') {
      return this.authorName(book.authorId);
    }
    if (property === 'category') {
      return this.categoryName(book.categoryId);
    }
    const value = book[property as keyof Book];
    return typeof value === 'number' ? value.toString() : String(value);
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
