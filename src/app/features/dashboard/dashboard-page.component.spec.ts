import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthorsStore } from '../../services/authors.store';
import { BooksStore } from '../../services/books.store';
import { CategoriesStore } from '../../services/categories.store';
import { CustomersStore } from '../../services/customers.store';
import { LoansStore } from '../../services/loans.store';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  const books = signal([
    { id: 1, title: 'Libro disponible', stock: 8, status: 'Disponible', categoryId: 1 },
    { id: 2, title: 'Libro escaso', stock: 2, status: 'Bajo stock', categoryId: 1 },
    { id: 3, title: 'Libro agotado', stock: 0, status: 'Agotado', categoryId: 2 },
  ]);
  const authors = signal([{ id: 1 }, { id: 2 }]);
  const categories = signal([
    { id: 1, name: 'Novela' },
    { id: 2, name: 'Ensayo' },
  ]);
  const customers = signal([{ id: 1 }, { id: 2 }, { id: 3 }]);
  const activeLoans = signal([
    { id: 1, customerId: 1, bookId: 1, dueDate: '2026-08-20' },
    { id: 2, customerId: 2, bookId: 2, dueDate: '2026-08-30' },
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        {
          provide: BooksStore,
          useValue: { books, totalBooks: computed(() => books().length) },
        },
        {
          provide: AuthorsStore,
          useValue: { authors, totalAuthors: computed(() => authors().length) },
        },
        {
          provide: CategoriesStore,
          useValue: { categories, totalCategories: computed(() => categories().length) },
        },
        {
          provide: CustomersStore,
          useValue: { customers, totalCustomers: computed(() => customers().length) },
        },
        {
          provide: LoansStore,
          useValue: {
            activeLoans,
            totalActive: computed(() => activeLoans().length),
            totalOverdue: computed(() => 1),
            status: (loan: { id: number }) => (loan.id === 1 ? 'Vencido' : 'Activo'),
          },
        },
      ],
    });
  });

  it('computes inventory and category metrics from the stores', () => {
    const component = TestBed.createComponent(DashboardPageComponent).componentInstance;

    expect(component.totalStock()).toBe(10);
    expect(component.inventoryStatus().map(({ count }) => count)).toEqual([1, 1, 1]);
    expect(component.categoryDistribution().map(({ count }) => count)).toEqual([2, 1]);
    expect(component.attentionBooks().map(({ title }) => title)).toEqual([
      'Libro agotado',
      'Libro escaso',
    ]);
    expect(component.dueLoans().map(({ id }) => id)).toEqual([1, 2]);
  });

  it('renders metric cards, progress bars and attention items', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.metric-card')).toHaveLength(7);
    expect(element.querySelectorAll('mat-progress-bar')).toHaveLength(2);
    expect(element.querySelectorAll('mat-list-item')).toHaveLength(4);
    expect(element.textContent).toContain('10');
  });
});
