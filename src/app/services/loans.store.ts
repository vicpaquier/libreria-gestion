import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Loan,
  LoanFormValue,
  LoanOperationResult,
  LoanStatus,
  ReturnLoanValue,
} from '../models/loan';
import { BooksStore } from './books.store';
import { CustomersStore } from './customers.store';

const INITIAL_LOANS: Loan[] = createInitialLoans();

@Injectable({ providedIn: 'root' })
export class LoansStore {
  private readonly booksStore = inject(BooksStore);
  private readonly customersStore = inject(CustomersStore);
  private readonly loansState = signal<Loan[]>(INITIAL_LOANS);

  readonly loans = this.loansState.asReadonly();
  readonly activeLoans = computed(() => this.loansState().filter((loan) => !loan.returnedDate));
  readonly returnedLoans = computed(() => this.loansState().filter((loan) => loan.returnedDate));
  readonly totalActive = computed(() => this.activeLoans().length);
  readonly totalOverdue = computed(
    () => this.activeLoans().filter((loan) => this.status(loan) === 'Vencido').length,
  );

  register(value: LoanFormValue): LoanOperationResult {
    if (!this.customersStore.customers().some((customer) => customer.id === value.customerId)) {
      return 'invalid-customer';
    }

    const book = this.booksStore.books().find((item) => item.id === value.bookId);
    if (!book) {
      return 'invalid-book';
    }
    if (value.dueDate < value.loanDate) {
      return 'invalid-date';
    }
    if (book.stock < 1) {
      return 'no-stock';
    }
    if (
      this.activeLoans().some(
        (loan) => loan.customerId === value.customerId && loan.bookId === value.bookId,
      )
    ) {
      return 'duplicate-active-loan';
    }
    if (!this.booksStore.adjustStock(value.bookId, -1)) {
      return 'no-stock';
    }

    const id = Math.max(0, ...this.loansState().map((loan) => loan.id)) + 1;
    this.loansState.update((loans) => [
      ...loans,
      { ...value, id, returnedDate: null, returnNotes: '' },
    ]);
    return 'success';
  }

  returnLoan(id: number, value: ReturnLoanValue): LoanOperationResult {
    const loan = this.loansState().find((item) => item.id === id);
    if (!loan) {
      return 'invalid-book';
    }
    if (loan.returnedDate) {
      return 'already-returned';
    }
    if (value.returnedDate < loan.loanDate) {
      return 'invalid-date';
    }
    if (!this.booksStore.adjustStock(loan.bookId, 1)) {
      return 'invalid-book';
    }

    this.loansState.update((loans) =>
      loans.map((item) => (item.id === id ? { ...item, ...value } : item)),
    );
    return 'success';
  }

  status(loan: Loan, today = toIsoDate(new Date())): LoanStatus {
    if (loan.returnedDate) {
      return 'Devuelto';
    }
    return loan.dueDate < today ? 'Vencido' : 'Activo';
  }

  hasBookHistory(bookId: number): boolean {
    return this.loansState().some((loan) => loan.bookId === bookId);
  }

  hasCustomerHistory(customerId: number): boolean {
    return this.loansState().some((loan) => loan.customerId === customerId);
  }
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function createInitialLoans(): Loan[] {
  const today = new Date();
  return [
    {
      id: 1,
      customerId: 1,
      bookId: 1,
      loanDate: toIsoDate(addDays(today, -10)),
      dueDate: toIsoDate(addDays(today, 4)),
      returnedDate: null,
      notes: 'Préstamo regular.',
      returnNotes: '',
    },
    {
      id: 2,
      customerId: 2,
      bookId: 3,
      loanDate: toIsoDate(addDays(today, -25)),
      dueDate: toIsoDate(addDays(today, -11)),
      returnedDate: null,
      notes: '',
      returnNotes: '',
    },
    {
      id: 3,
      customerId: 3,
      bookId: 5,
      loanDate: toIsoDate(addDays(today, -40)),
      dueDate: toIsoDate(addDays(today, -26)),
      returnedDate: toIsoDate(addDays(today, -28)),
      notes: '',
      returnNotes: 'Devuelto en buen estado.',
    },
    {
      id: 4,
      customerId: 4,
      bookId: 6,
      loanDate: toIsoDate(addDays(today, -5)),
      dueDate: toIsoDate(addDays(today, 9)),
      returnedDate: null,
      notes: '',
      returnNotes: '',
    },
  ];
}
