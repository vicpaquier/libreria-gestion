import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { BooksStore } from '../../services/books.store';
import { CustomersStore } from '../../services/customers.store';
import { errorMessage } from '../../services/http-error';
import { ReservationsStore } from '../../services/reservations.store';

@Component({
  selector: 'app-reservations-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './reservations-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class ReservationsPageComponent {
  readonly store = inject(ReservationsStore);
  readonly users = inject(CustomersStore);
  readonly books = inject(BooksStore);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  private historyVersion = 0;
  readonly historyLoading = signal(false);
  readonly historyUserId = signal<number | null>(null);
  readonly pending = signal<string | null>(null);
  readonly columns = ['reserva', 'estado', 'acciones'];
  readonly form = this.fb.nonNullable.group({
    usuarioId: [0, Validators.min(1)],
    libroId: [0, Validators.min(1)],
  });
  readonly historyForm = this.fb.nonNullable.group({
    usuarioId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
  });

  constructor() {
    this.users.load(0, 100, '', 'ACTIVO');
    this.books.load(0, 100);
  }

  loadHistory(): void {
    if (this.historyForm.invalid) return this.historyForm.markAllAsTouched();
    this.loadHistoryById(this.historyForm.controls.usuarioId.value);
  }

  private loadHistoryById(usuarioId: number): void {
    this.historyUserId.set(usuarioId);
    const version = ++this.historyVersion;
    this.historyLoading.set(true);
    this.users
      .history(usuarioId)
      .pipe(finalize(() => version === this.historyVersion && this.historyLoading.set(false)))
      .subscribe({
        next: (history) =>
          version === this.historyVersion && this.store.setFromHistory(history.reservas),
        error: (error) => {
          if (version === this.historyVersion)
            this.notify(errorMessage(error, 'No se pudo cargar el historial de reservas.'));
        },
      });
  }

  create(): void {
    if (this.form.invalid || this.pending()) return;
    const value = this.form.getRawValue();
    this.pending.set('create');
    this.store
      .create(value)
      .pipe(finalize(() => this.pending.set(null)))
      .subscribe({
        next: () => {
          this.form.controls.libroId.reset(0);
          if (this.historyUserId() === value.usuarioId) this.loadHistoryById(value.usuarioId);
          this.notify('Reserva creada.');
        },
        error: (error) => this.notify(errorMessage(error, 'No se pudo crear la reserva.')),
      });
  }

  attend(id: number): void {
    this.changeStatus(`attend-${id}`, () => this.store.attend(id), 'Reserva atendida.');
  }

  cancel(id: number): void {
    this.changeStatus(`cancel-${id}`, () => this.store.cancel(id), 'Reserva cancelada.');
  }

  private changeStatus(
    operation: string,
    request: () => ReturnType<ReservationsStore['attend']>,
    message: string,
  ): void {
    if (this.pending()) return;
    this.pending.set(operation);
    request()
      .pipe(finalize(() => this.pending.set(null)))
      .subscribe({
        next: () => {
          const usuarioId = this.historyUserId();
          if (usuarioId) this.loadHistoryById(usuarioId);
          this.notify(message);
        },
        error: (error) => this.notify(errorMessage(error, 'No se pudo cambiar la reserva.')),
      });
  }

  private notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 3500 });
  }
}
