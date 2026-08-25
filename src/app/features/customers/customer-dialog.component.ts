import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Customer, CustomerFormValue } from '../../models/customer';

export interface CustomerDialogData {
  customer?: Customer;
}

@Component({
  selector: 'app-customer-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.css',
})
export class CustomerDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CustomerDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  readonly data = inject<CustomerDialogData>(MAT_DIALOG_DATA);
  readonly isEditing = Boolean(this.data.customer);

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.customer?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    email: [
      this.data.customer?.email ?? '',
      [Validators.required, Validators.email, Validators.maxLength(120)],
    ],
    phone: [this.data.customer?.phone ?? '', [Validators.required, Validators.maxLength(30)]],
    address: [this.data.customer?.address ?? '', [Validators.required, Validators.maxLength(200)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: CustomerFormValue = this.form.getRawValue();
    this.dialogRef.close(result);
  }
}
