import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Author, AuthorFormValue } from '../../models/author';

export interface AuthorDialogData {
  author?: Author;
}

@Component({
  selector: 'app-author-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './author-dialog.component.html',
  styleUrl: './author-dialog.component.css',
})
export class AuthorDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AuthorDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  readonly data = inject<AuthorDialogData>(MAT_DIALOG_DATA);
  readonly isEditing = Boolean(this.data.author);

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.author?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    nationality: [
      this.data.author?.nationality ?? '',
      [Validators.required, Validators.maxLength(60)],
    ],
    biography: [this.data.author?.biography ?? '', Validators.maxLength(500)],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: AuthorFormValue = this.form.getRawValue();
    this.dialogRef.close(result);
  }
}
