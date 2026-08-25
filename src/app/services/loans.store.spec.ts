import { TestBed } from '@angular/core/testing';
import { Loan } from '../models/loan';
import { BooksStore } from './books.store';
import { LoansStore } from './loans.store';

describe('LoansStore', () => {
  it('registers a loan and decreases available stock', () => {
    const loansStore = TestBed.inject(LoansStore);
    const booksStore = TestBed.inject(BooksStore);
    const stock = booksStore.books().find((book) => book.id === 2)!.stock;

    const result = loansStore.register({
      customerId: 10,
      bookId: 2,
      loanDate: '2026-08-24',
      dueDate: '2026-09-07',
      notes: '',
    });

    expect(result).toBe('success');
    expect(booksStore.books().find((book) => book.id === 2)?.stock).toBe(stock - 1);
  });

  it('returns a loan, restores stock and rejects a duplicate return', () => {
    const loansStore = TestBed.inject(LoansStore);
    const booksStore = TestBed.inject(BooksStore);
    const originalStock = booksStore.books().find((book) => book.id === 2)!.stock;
    loansStore.register({
      customerId: 10,
      bookId: 2,
      loanDate: '2026-08-24',
      dueDate: '2026-09-07',
      notes: '',
    });
    const loan = loansStore.loans().at(-1)!;

    expect(
      loansStore.returnLoan(loan.id, {
        returnedDate: '2026-08-25',
        returnNotes: 'Buen estado.',
      }),
    ).toBe('success');
    expect(booksStore.books().find((book) => book.id === 2)?.stock).toBe(originalStock);
    expect(loansStore.returnLoan(loan.id, { returnedDate: '2026-08-25', returnNotes: '' })).toBe(
      'already-returned',
    );
    expect(booksStore.books().find((book) => book.id === 2)?.stock).toBe(originalStock);
  });

  it('rejects loans without stock and duplicate active loans', () => {
    const loansStore = TestBed.inject(LoansStore);

    expect(
      loansStore.register({
        customerId: 10,
        bookId: 4,
        loanDate: '2026-08-24',
        dueDate: '2026-09-07',
        notes: '',
      }),
    ).toBe('no-stock');
    expect(
      loansStore.register({
        customerId: 1,
        bookId: 1,
        loanDate: '2026-08-24',
        dueDate: '2026-09-07',
        notes: '',
      }),
    ).toBe('duplicate-active-loan');
  });

  it('derives active, overdue and returned states from dates', () => {
    const store = TestBed.inject(LoansStore);
    const baseLoan: Loan = {
      id: 99,
      customerId: 1,
      bookId: 1,
      loanDate: '2026-08-01',
      dueDate: '2026-08-20',
      returnedDate: null,
      notes: '',
      returnNotes: '',
    };

    expect(store.status(baseLoan, '2026-08-19')).toBe('Activo');
    expect(store.status(baseLoan, '2026-08-21')).toBe('Vencido');
    expect(store.status({ ...baseLoan, returnedDate: '2026-08-18' }, '2026-08-21')).toBe(
      'Devuelto',
    );
  });
});
