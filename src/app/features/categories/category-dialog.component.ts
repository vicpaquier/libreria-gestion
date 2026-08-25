import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Category, CategoryFormValue } from '../../models/category';

export interface CategoryDialogData {
  category?: Category;
}

@Component({
  selector: 'app-category-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.css',
})
export class CategoryDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  readonly data = inject<CategoryDialogData>(MAT_DIALOG_DATA);
  readonly isEditing = Boolean(this.data.category);

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.category?.name ?? '', [Validators.required, Validators.maxLength(60)]],
    description: [
      this.data.category?.description ?? '',
      [Validators.required, Validators.maxLength(300)],
    ],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: CategoryFormValue = this.form.getRawValue();
    this.dialogRef.close(result);
  }
}
