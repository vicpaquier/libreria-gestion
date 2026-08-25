import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NewLoanDialogComponent } from './new-loan-dialog.component';

describe('NewLoanDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  beforeEach(() => {
    dialogRef.close.mockReset();
    TestBed.configureTestingModule({
      imports: [NewLoanDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }],
    });
  });

  it('defaults the due date to fourteen days after the loan date', () => {
    const component = TestBed.createComponent(NewLoanDialogComponent).componentInstance;
    const loanDate = component.form.controls.loanDate.value;
    const dueDate = component.form.controls.dueDate.value;
    const difference = Math.round((dueDate.getTime() - loanDate.getTime()) / 86_400_000);

    expect(difference).toBe(14);
  });

  it('rejects a due date before the loan date', () => {
    const component = TestBed.createComponent(NewLoanDialogComponent).componentInstance;
    component.form.patchValue({
      customerId: 1,
      bookId: 2,
      loanDate: new Date(2026, 7, 24),
      dueDate: new Date(2026, 7, 23),
    });

    expect(component.form.hasError('dateRange')).toBe(true);
    component.submit();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
