import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { LoansPageComponent } from './loans-page.component';

describe('LoansPageComponent', () => {
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    dialog.open.mockReset();
    snackBar.open.mockReset();
    TestBed.configureTestingModule({ imports: [LoansPageComponent] });
    TestBed.overrideComponent(LoansPageComponent, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      },
    });
  });

  it('renders active loans and the return history tabs', () => {
    const fixture = TestBed.createComponent(LoansPageComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('[role="tab"]')).toHaveLength(2);
    expect(fixture.componentInstance.filteredActiveLoans()).toHaveLength(3);
    expect(fixture.componentInstance.filteredHistory()).toHaveLength(1);
  });

  it('registers a loan and shows Material feedback', () => {
    const component = TestBed.createComponent(LoansPageComponent).componentInstance;
    dialog.open.mockReturnValue({
      afterClosed: () =>
        of({
          customerId: 10,
          bookId: 2,
          loanDate: '2026-08-24',
          dueDate: '2026-09-07',
          notes: '',
        }),
    });

    component.openNewLoanDialog();

    expect(component.loansStore.totalActive()).toBe(4);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Préstamo registrado correctamente.',
      'Cerrar',
      expect.objectContaining({ duration: 4000 }),
    );
  });
});
