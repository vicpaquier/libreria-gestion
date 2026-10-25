import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { EstadoMulta } from '../../models/api';
import { FinesStore } from '../../services/fines.store';
import { errorMessage } from '../../services/http-error';
@Component({
  selector: 'app-fines-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './fines-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class FinesPageComponent {
  readonly store = inject(FinesStore);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly pending = signal<string | null>(null);
  readonly columns = ['multa', 'monto', 'estado', 'acciones'];
  readonly form = this.fb.nonNullable.group({
    prestamoId: [0, Validators.min(1)],
    monto: [0, Validators.min(0)],
    motivo: ['', Validators.required],
  });
  readonly filtersForm = this.fb.group({
    usuarioId: [null as number | null],
    prestamoId: [null as number | null],
    estado: [null as EstadoMulta | null],
    fecha: [''],
  });
  constructor() {
    this.load();
  }
  load(): void {
    const filters = this.filtersForm.getRawValue();
    this.store.load(this.page(), this.size(), {
      usuarioId: filters.usuarioId ?? undefined,
      prestamoId: filters.prestamoId ?? undefined,
      estado: filters.estado ?? undefined,
      fecha: filters.fecha || undefined,
    });
  }
  applyFilters(): void {
    this.page.set(0);
    this.load();
  }
  changePage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.size.set(e.pageSize);
    this.load();
  }
  create(): void {
    if (this.form.invalid || this.pending()) return;
    this.pending.set('create');
    this.store
      .create(this.form.getRawValue())
      .pipe(finalize(() => this.pending.set(null)))
      .subscribe({
        next: () => {
          this.form.reset({ prestamoId: 0, monto: 0, motivo: '' });
          this.notify('Multa registrada.');
        },
        error: (e) => this.notify(errorMessage(e, 'No se pudo registrar.')),
      });
  }
  pay(id: number): void {
    this.changeStatus(`pay-${id}`, this.store.pay(id), 'Multa pagada.');
  }
  cancel(id: number): void {
    this.changeStatus(`cancel-${id}`, this.store.cancel(id), 'Multa cancelada.');
  }
  private changeStatus(
    operation: string,
    request: ReturnType<FinesStore['pay']>,
    message: string,
  ): void {
    if (this.pending()) return;
    this.pending.set(operation);
    request.pipe(finalize(() => this.pending.set(null))).subscribe({
      next: () => this.notify(message),
      error: (error) => this.notify(errorMessage(error, 'No se pudo actualizar la multa.')),
    });
  }
  private notify(m: string): void {
    this.snack.open(m, 'Cerrar', { duration: 3500 });
  }
}
