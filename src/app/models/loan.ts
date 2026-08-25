export type LoanStatus = 'Activo' | 'Vencido' | 'Devuelto';

export interface Loan {
  id: number;
  customerId: number;
  bookId: number;
  loanDate: string;
  dueDate: string;
  returnedDate: string | null;
  notes: string;
  returnNotes: string;
}

export interface LoanFormValue {
  customerId: number;
  bookId: number;
  loanDate: string;
  dueDate: string;
  notes: string;
}

export interface ReturnLoanValue {
  returnedDate: string;
  returnNotes: string;
}

export type LoanOperationResult =
  | 'success'
  | 'invalid-customer'
  | 'invalid-book'
  | 'invalid-date'
  | 'no-stock'
  | 'duplicate-active-loan'
  | 'already-returned';
