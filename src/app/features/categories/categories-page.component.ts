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
import { Category } from '../../models/category';
import { BooksStore } from '../../services/books.store';
import { CategoriesStore } from '../../services/categories.store';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { CategoryDialogComponent } from './category-dialog.component';

@Component({
  selector: 'app-categories-page',
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
  templateUrl: './categories-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class CategoriesPageComponent {
  readonly categoriesStore = inject(CategoriesStore);
  private readonly booksStore = inject(BooksStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(8);
  readonly sort = signal<Sort>({ active: 'name', direction: 'asc' });
  readonly displayedColumns = ['name', 'description', 'books', 'actions'];

  readonly filteredCategories = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.categoriesStore
      .categories()
      .filter((category) =>
        !query
          ? true
          : [category.name, category.description].some((value) =>
              value.toLowerCase().includes(query),
            ),
      );
  });

  readonly sortedCategories = computed(() => {
    const { active, direction } = this.sort();
    if (!direction) return [...this.filteredCategories()];
    return [...this.filteredCategories()].sort((first, second) => {
      const comparison = this.sortValue(first, active).localeCompare(
        this.sortValue(second, active),
        'es',
        { numeric: true },
      );
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  readonly pagedCategories = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedCategories().slice(start, start + this.pageSize());
  });

  bookCount(categoryId: number): number {
    return this.booksStore.books().filter((book) => book.categoryId === categoryId).length;
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
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: 'min(92vw, 42rem)',
      maxWidth: '100vw',
      data: {},
    });
    ref.afterClosed().subscribe((category) => {
      if (category) {
        this.categoriesStore.add(category);
        this.notify('Categoría creada correctamente.');
      }
    });
  }

  openEditDialog(category: Category): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: 'min(92vw, 42rem)',
      maxWidth: '100vw',
      data: { category },
    });
    ref.afterClosed().subscribe((changes) => {
      if (changes) {
        this.categoriesStore.update(category.id, changes);
        this.notify('Categoría actualizada correctamente.');
      }
    });
  }

  confirmDelete(category: Category): void {
    const count = this.bookCount(category.id);
    if (count > 0) {
      this.notify(
        `No se puede eliminar: tiene ${count} libro${count === 1 ? '' : 's'} asociado${count === 1 ? '' : 's'}.`,
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: 'min(92vw, 28rem)',
      data: { title: 'Eliminar categoría', message: `¿Quieres eliminar «${category.name}»?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.categoriesStore.remove(category.id);
        this.pageIndex.set(Math.min(this.pageIndex(), this.lastPageIndex()));
        this.notify('Categoría eliminada correctamente.');
      }
    });
  }

  private lastPageIndex(): number {
    return Math.max(0, Math.ceil(this.filteredCategories().length / this.pageSize()) - 1);
  }

  private sortValue(category: Category, property: string): string {
    if (property === 'books') return this.bookCount(category.id).toString();
    return String(category[property as keyof Category]);
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3500, horizontalPosition: 'end' });
  }
}
