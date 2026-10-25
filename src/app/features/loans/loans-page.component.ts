import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { DetallePrestamo, EstadoPrestamo } from '../../models/api';
import { errorMessage } from '../../services/http-error';
import { LoansStore } from '../../services/loans.store';
import { NewLoanDialogComponent } from './new-loan-dialog.component';
@Component({
  selector: 'app-loans-page',
  imports: [
    DatePipe,
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './loans-page.component.html',
  styleUrls: ['../../shared/crud-page.css', './loans-page.component.css'],
})
export class LoansPageComponent {
  readonly store = inject(LoansStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly status = signal<EstadoPrestamo | undefined>(undefined);
  readonly pending = signal<string | null>(null);
  readonly columns = ['id', 'usuario', 'fechas', 'estado', 'detalles', 'multas'];
  constructor() {
    this.load();
  }
  load(): void {
    this.store.load(this.page(), this.size(), this.status());
  }
  filter(status: EstadoPrestamo | ''): void {
    this.status.set(status || undefined);
    this.page.set(0);
    this.load();
  }
  changePage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.size.set(e.pageSize);
    this.load();
  }
  create(): void {
    if (this.pending()) return;
    this.dialog
      .open(NewLoanDialogComponent, { width: 'min(92vw,46rem)' })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.pending.set('create');
          this.store
            .register(value)
            .pipe(finalize(() => this.pending.set(null)))
            .subscribe({
              next: () => this.notify('Préstamo creado.'),
              error: (e) => this.notify(errorMessage(e, 'No se pudo crear el préstamo.')),
            });
        }
      });
  }
  returnDetail(prestamoId: number, detail: DetallePrestamo): void {
    this.runDetailOperation(
      `return-${detail.id}`,
      this.store.returnDetail(prestamoId, detail.id),
      'Devolución registrada.',
    );
  }
  lost(prestamoId: number, detail: DetallePrestamo): void {
    this.runDetailOperation(
      `lost-${detail.id}`,
      this.store.markLost(prestamoId, detail.id),
      'Ejemplar marcado como perdido.',
    );
  }
  private runDetailOperation(
    operation: string,
    request: ReturnType<LoansStore['returnDetail']>,
    successMessage: string,
  ): void {
    if (this.pending()) return;
    this.pending.set(operation);
    request.pipe(finalize(() => this.pending.set(null))).subscribe({
      next: () => this.notify(successMessage),
      error: (error) => this.notify(errorMessage(error, 'No se pudo actualizar el préstamo.')),
    });
  }
  private notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 4000 });
  }
}
