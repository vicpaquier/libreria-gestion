import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Usuario, UsuarioSolicitud } from '../../models/api';
@Component({
  selector: 'app-customer-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.css',
})
export class CustomerDialogComponent {
  private readonly ref = inject(MatDialogRef<CustomerDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly data = inject<{ customer?: Usuario }>(MAT_DIALOG_DATA);
  readonly isEditing = !!this.data.customer;
  readonly submitted = signal(false);
  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.customer?.nombre ?? '', Validators.required],
    apellido: [this.data.customer?.apellido ?? '', Validators.required],
    cedula: [this.data.customer?.cedula ?? '', Validators.required],
    email: [this.data.customer?.email ?? '', Validators.email],
    telefono: [this.data.customer?.telefono ?? ''],
    direccion: [this.data.customer?.direccion ?? ''],
  });
  submit(): void {
    if (this.submitted()) return;
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.submitted.set(true);
    const v = this.form.getRawValue();
    const result: UsuarioSolicitud = {
      nombre: v.nombre,
      apellido: v.apellido,
      cedula: v.cedula,
      email: v.email.trim() || null,
      telefono: v.telefono.trim() || null,
      direccion: v.direccion.trim() || null,
    };
    this.ref.close(result);
  }
}
