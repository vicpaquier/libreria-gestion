import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Loan, LoanOperationResult } from '../../models/loan';
import { BooksStore } from '../../services/books.store';
import { CustomersStore } from '../../services/customers.store';
import { LoansStore } from '../../services/loans.store';
import { NewLoanDialogComponent } from './new-loan-dialog.component';
import { ReturnLoanDialogComponent } from './return-loan-dialog.component';

@Component({
  selector: 'app-loans-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './loans-page.component.html',
  styleUrls: ['../../shared/crud-page.css', './loans-page.component.css'],
})
export class LoansPageComponent {
  readonly loansStore = inject(LoansStore);
  private readonly booksStore = inject(BooksStore);
  private readonly customersStore = inject(CustomersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly query = signal('');
  readonly activePageIndex = signal(0);
  readonly historyPageIndex = signal(0);
  readonly pageSize = signal(8);
  readonly activeSort = signal<Sort>({ active: 'dueDate', direction: 'asc' });
  readonly historySort = signal<Sort>({ active: 'returnedDate', direction: 'desc' });
  readonly activeColumns = ['customer', 'book', 'loanDate', 'dueDate', 'status', 'actions'];
  readonly historyColumns = ['customer', 'book', 'loanDate', 'dueDate', 'returnedDate', 'status'];

  private readonly customerNames = computed(
    () => new Map(this.customersStore.customers().map((customer) => [customer.id, customer.name])),
  );
  private readonly books = computed(
    () => new Map(this.booksStore.books().map((book) => [book.id, book])),
  );

  readonly filteredActiveLoans = computed(() =>
    this.filterLoans(this.loansStore.activeLoans(), this.query()),
  );
  readonly filteredHistory = computed(() =>
    this.filterLoans(this.loansStore.returnedLoans(), this.query()),
  );
  readonly sortedActiveLoans = computed(() =>
    this.sortLoans(this.filteredActiveLoans(), this.activeSort()),
  );
  readonly sortedHistory = computed(() =>
    this.sortLoans(this.filteredHistory(), this.historySort()),
  );
  readonly pagedActiveLoans = computed(() => {
    const start = this.activePageIndex() * this.pageSize();
    return this.sortedActiveLoans().slice(start, start + this.pageSize());
  });
  readonly pagedHistory = computed(() => {
    const start = this.historyPageIndex() * this.pageSize();
    return this.sortedHistory().slice(start, start + this.pageSize());
  });

  customerName(id: number): string {
    return this.customerNames().get(id) ?? 'Cliente no disponible';
  }

  bookTitle(id: number): string {
    return this.books().get(id)?.title ?? 'Libro no disponible';
  }

  bookIsbn(id: number): string {
    return this.books().get(id)?.isbn ?? 'Sin ISBN';
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activePageIndex.set(0);
    this.historyPageIndex.set(0);
  }

  onActiveSort(sort: Sort): void {
    this.activeSort.set(sort);
    this.activePageIndex.set(0);
  }

  onHistorySort(sort: Sort): void {
    this.historySort.set(sort);
    this.historyPageIndex.set(0);
  }

  onActivePage(event: PageEvent): void {
    this.activePageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onHistoryPage(event: PageEvent): void {
    this.historyPageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openNewLoanDialog(): void {
    const ref = this.dialog.open(NewLoanDialogComponent, {
      width: 'min(92vw, 46rem)',
      maxWidth: '100vw',
    });
    ref.afterClosed().subscribe((value) => {
      if (value) {
        this.handleResult(this.loansStore.register(value), 'Préstamo registrado correctamente.');
      }
    });
  }

  openReturnDialog(loan: Loan): void {
    const ref = this.dialog.open(ReturnLoanDialogComponent, {
      width: 'min(92vw, 38rem)',
      maxWidth: '100vw',
      data: {
        loan,
        customerName: this.customerName(loan.customerId),
        bookTitle: this.bookTitle(loan.bookId),
      },
    });
    ref.afterClosed().subscribe((value) => {
      if (value) {
        const result = this.loansStore.returnLoan(loan.id, value);
        this.handleResult(result, 'Devolución registrada correctamente.');
      }
    });
  }

  private filterLoans(loans: Loan[], rawQuery: string): Loan[] {
    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      return loans;
    }
    return loans.filter((loan) =>
      [
        this.customerName(loan.customerId),
        this.bookTitle(loan.bookId),
        this.bookIsbn(loan.bookId),
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }

  private sortLoans(loans: Loan[], sort: Sort): Loan[] {
    if (!sort.direction) {
      return [...loans];
    }
    return [...loans].sort((first, second) => {
      const comparison = this.sortValue(first, sort.active).localeCompare(
        this.sortValue(second, sort.active),
        'es',
        { numeric: true },
      );
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  private sortValue(loan: Loan, property: string): string {
    if (property === 'customer') return this.customerName(loan.customerId);
    if (property === 'book') return this.bookTitle(loan.bookId);
    if (property === 'status') return this.loansStore.status(loan);
    return String(loan[property as keyof Loan] ?? '');
  }

  private handleResult(result: LoanOperationResult, successMessage: string): void {
    const messages: Record<LoanOperationResult, string> = {
      success: successMessage,
      'invalid-customer': 'El cliente seleccionado ya no existe.',
      'invalid-book': 'El libro seleccionado ya no existe.',
      'invalid-date': 'Las fechas indicadas no son válidas.',
      'no-stock': 'El libro ya no tiene unidades disponibles.',
      'duplicate-active-loan': 'El cliente ya tiene un préstamo activo de este libro.',
      'already-returned': 'Este préstamo ya había sido devuelto.',
    };
    this.snackBar.open(messages[result], 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
