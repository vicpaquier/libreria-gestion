import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Customer } from '../../models/customer';
import { CustomersStore } from '../../services/customers.store';
import { LoansStore } from '../../services/loans.store';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { CustomerDialogComponent } from './customer-dialog.component';

@Component({
  selector: 'app-customers-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './customers-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class CustomersPageComponent {
  readonly customersStore = inject(CustomersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly loansStore = inject(LoansStore);

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(8);
  readonly sort = signal<Sort>({ active: 'name', direction: 'asc' });
  readonly displayedColumns = ['name', 'email', 'phone', 'address', 'actions'];

  readonly filteredCustomers = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.customersStore
      .customers()
      .filter((customer) =>
        !query
          ? true
          : [customer.name, customer.email, customer.phone, customer.address].some((value) =>
              value.toLowerCase().includes(query),
            ),
      );
  });

  readonly sortedCustomers = computed(() => {
    const { active, direction } = this.sort();
    if (!direction) {
      return [...this.filteredCustomers()];
    }

    return [...this.filteredCustomers()].sort((first, second) => {
      const comparison = String(first[active as keyof Customer]).localeCompare(
        String(second[active as keyof Customer]),
        'es',
        { numeric: true },
      );
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  readonly pagedCustomers = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedCustomers().slice(start, start + this.pageSize());
  });

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  onSort(sort: Sort): void {
    this.sort.set(sort);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CustomerDialogComponent, {
      width: 'min(92vw, 46rem)',
      maxWidth: '100vw',
      data: {},
    });
    ref.afterClosed().subscribe((customer) => {
      if (customer) {
        this.customersStore.add(customer);
        this.notify('Cliente creado correctamente.');
      }
    });
  }

  openEditDialog(customer: Customer): void {
    const ref = this.dialog.open(CustomerDialogComponent, {
      width: 'min(92vw, 46rem)',
      maxWidth: '100vw',
      data: { customer },
    });
    ref.afterClosed().subscribe((changes) => {
      if (changes) {
        this.customersStore.update(customer.id, changes);
        this.notify('Cliente actualizado correctamente.');
      }
    });
  }

  confirmDelete(customer: Customer): void {
    if (this.loansStore.hasCustomerHistory(customer.id)) {
      this.notify('No se puede eliminar: el cliente tiene historial de préstamos.');
      return;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: 'min(92vw, 28rem)',
      maxWidth: '100vw',
      data: {
        title: 'Eliminar cliente',
        message: `¿Quieres eliminar a «${customer.name}»? Esta acción no se puede deshacer.`,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.customersStore.remove(customer.id);
        this.pageIndex.set(Math.min(this.pageIndex(), this.lastPageIndex()));
        this.notify('Cliente eliminado correctamente.');
      }
    });
  }

  private lastPageIndex(): number {
    return Math.max(0, Math.ceil(this.filteredCustomers().length / this.pageSize()) - 1);
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
