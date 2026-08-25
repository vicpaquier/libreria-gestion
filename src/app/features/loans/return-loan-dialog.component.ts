import { Component, inject } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Loan, ReturnLoanValue } from '../../models/loan';
import { toIsoDate } from '../../services/loans.store';

export interface ReturnLoanDialogData {
  loan: Loan;
  customerName: string;
  bookTitle: string;
}

@Component({
  selector: 'app-return-loan-dialog',
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './return-loan-dialog.component.html',
  styleUrl: './loan-dialog.css',
})
export class ReturnLoanDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ReturnLoanDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  readonly data = inject<ReturnLoanDialogData>(MAT_DIALOG_DATA);
  readonly minimumDate = fromIsoDate(this.data.loan.loanDate);

  readonly form = this.formBuilder.nonNullable.group(
    {
      returnedDate: [startOfDay(new Date()), Validators.required],
      returnNotes: ['', Validators.maxLength(300)],
    },
    { validators: returnDateValidator(this.minimumDate) },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const result: ReturnLoanValue = {
      returnedDate: toIsoDate(value.returnedDate),
      returnNotes: value.returnNotes,
    };
    this.dialogRef.close(result);
  }
}

function returnDateValidator(minimumDate: Date) {
  return (control: AbstractControl): ValidationErrors | null => {
    const returnedDate = control.get('returnedDate')?.value as Date | null;
    return returnedDate && returnedDate < minimumDate ? { returnDate: true } : null;
  };
}

function fromIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
