import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { CustomerFormValue } from '../../models/customer';
import { CustomersPageComponent } from './customers-page.component';

describe('CustomersPageComponent', () => {
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    dialog.open.mockReset();
    snackBar.open.mockReset();
    TestBed.configureTestingModule({ imports: [CustomersPageComponent] });
    TestBed.overrideComponent(CustomersPageComponent, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      },
    });
  });

  it('renders the paginated customers table', () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table')).toBeTruthy();
    expect(element.querySelector('mat-paginator')).toBeTruthy();
    expect(fixture.componentInstance.filteredCustomers()).toHaveLength(10);
  });

  it('creates a customer and shows Material feedback', () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    const component = fixture.componentInstance;
    const customer: CustomerFormValue = {
      name: 'Laura Gómez',
      email: 'laura.gomez@example.com',
      phone: '+34 611 222 333',
      address: 'Calle Nueva 10, Madrid',
    };
    dialog.open.mockReturnValue({ afterClosed: () => of(customer) });

    component.openCreateDialog();

    expect(component.customersStore.totalCustomers()).toBe(11);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Cliente creado correctamente.',
      'Cerrar',
      expect.objectContaining({ duration: 3500 }),
    );
  });

  it('blocks deletion when the customer has loan history', () => {
    const component = TestBed.createComponent(CustomersPageComponent).componentInstance;
    component.confirmDelete(component.customersStore.customers()[0]);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'No se puede eliminar: el cliente tiene historial de préstamos.',
      'Cerrar',
      expect.anything(),
    );
  });
});
