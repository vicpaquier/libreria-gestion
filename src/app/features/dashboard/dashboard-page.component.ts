import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthorsStore } from '../../services/authors.store';
import { BooksStore } from '../../services/books.store';
import { CategoriesStore } from '../../services/categories.store';
import { CustomersStore } from '../../services/customers.store';
import { LoansStore } from '../../services/loans.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, MatCardModule, MatIconModule, MatListModule, MatProgressBarModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent {
  readonly booksStore = inject(BooksStore);
  readonly authorsStore = inject(AuthorsStore);
  readonly categoriesStore = inject(CategoriesStore);
  readonly customersStore = inject(CustomersStore);
  readonly loansStore = inject(LoansStore);
  private readonly customerNames = computed(
    () => new Map(this.customersStore.customers().map((customer) => [customer.id, customer.name])),
  );
  private readonly bookTitles = computed(
    () => new Map(this.booksStore.books().map((book) => [book.id, book.title])),
  );

  readonly totalStock = computed(() =>
    this.booksStore.books().reduce((total, book) => total + book.stock, 0),
  );

  readonly inventoryStatus = computed(() => {
    const books = this.booksStore.books();

    return [
      {
        label: 'Disponibles',
        count: books.filter((book) => book.status === 'Disponible').length,
        icon: 'check_circle',
        tone: 'available',
      },
      {
        label: 'Bajo stock',
        count: books.filter((book) => book.status === 'Bajo stock').length,
        icon: 'warning',
        tone: 'low',
      },
      {
        label: 'Agotados',
        count: books.filter((book) => book.status === 'Agotado').length,
        icon: 'error',
        tone: 'out',
      },
    ];
  });

  readonly categoryDistribution = computed(() => {
    const books = this.booksStore.books();
    const total = books.length;

    return this.categoriesStore
      .categories()
      .map((category) => {
        const count = books.filter((book) => book.categoryId === category.id).length;
        return {
          id: category.id,
          name: category.name,
          count,
          percentage: total === 0 ? 0 : (count / total) * 100,
        };
      })
      .sort((first, second) => second.count - first.count || first.name.localeCompare(second.name));
  });

  readonly attentionBooks = computed(() =>
    this.booksStore
      .books()
      .filter((book) => book.status !== 'Disponible')
      .sort(
        (first, second) => first.stock - second.stock || first.title.localeCompare(second.title),
      ),
  );
  readonly dueLoans = computed(() =>
    [...this.loansStore.activeLoans()]
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
      .slice(0, 5),
  );

  customerName(id: number): string {
    return this.customerNames().get(id) ?? 'Cliente no disponible';
  }

  bookTitle(id: number): string {
    return this.bookTitles().get(id) ?? 'Libro no disponible';
  }
}
