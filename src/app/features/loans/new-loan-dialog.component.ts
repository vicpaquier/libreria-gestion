import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CrearPrestamoSolicitud } from '../../models/api';
import { BooksStore } from '../../services/books.store';
import { CustomersStore } from '../../services/customers.store';
@Component({
  selector: 'app-new-loan-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './new-loan-dialog.component.html',
  styleUrl: './loan-dialog.css',
})
export class NewLoanDialogComponent {
  private readonly ref = inject(MatDialogRef<NewLoanDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly books = inject(BooksStore);
  readonly users = inject(CustomersStore);
  readonly form = this.fb.nonNullable.group({
    usuarioId: [0, Validators.min(1)],
    librosIds: [[] as number[], Validators.required],
    fechaVencimiento: ['', Validators.required],
  });
  readonly submitted = signal(false);
  constructor() {
    this.books.load(0, 100, { disponible: true });
    this.users.load(0, 100, '', 'ACTIVO');
  }
  submit(): void {
    if (this.submitted()) return;
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.submitted.set(true);
    const v = this.form.getRawValue();
    const result: CrearPrestamoSolicitud = {
      usuarioId: Number(v.usuarioId),
      librosIds: v.librosIds.map(Number),
      fechaVencimiento: v.fechaVencimiento,
    };
    this.ref.close(result);
  }
}
