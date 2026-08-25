import { Component, computed, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoanFormValue } from '../../models/loan';
import { BooksStore } from '../../services/books.store';
import { CustomersStore } from '../../services/customers.store';
import { addDays, toIsoDate } from '../../services/loans.store';

@Component({
  selector: 'app-new-loan-dialog',
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './new-loan-dialog.component.html',
  styleUrl: './loan-dialog.css',
})
export class NewLoanDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NewLoanDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  readonly booksStore = inject(BooksStore);
  readonly customersStore = inject(CustomersStore);
  readonly availableBooks = computed(() =>
    this.booksStore.books().filter((book) => book.stock > 0),
  );
  readonly today = startOfDay(new Date());

  readonly form = this.formBuilder.nonNullable.group(
    {
      customerId: [0, Validators.min(1)],
      bookId: [0, Validators.min(1)],
      loanDate: [this.today, Validators.required],
      dueDate: [addDays(this.today, 14), Validators.required],
      notes: ['', Validators.maxLength(300)],
    },
    { validators: dateRangeValidator },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const result: LoanFormValue = {
      customerId: value.customerId,
      bookId: value.bookId,
      loanDate: toIsoDate(value.loanDate),
      dueDate: toIsoDate(value.dueDate),
      notes: value.notes,
    };
    this.dialogRef.close(result);
  }
}

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const loanDate = control.get('loanDate')?.value as Date | null;
  const dueDate = control.get('dueDate')?.value as Date | null;
  return loanDate && dueDate && dueDate < loanDate ? { dateRange: true } : null;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
