import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Book, BookFormValue } from '../../models/book';
import { AuthorsStore } from '../../services/authors.store';
import { CategoriesStore } from '../../services/categories.store';

export interface BookDialogData {
  book?: Book;
}

@Component({
  selector: 'app-book-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './book-dialog.component.html',
  styleUrl: './book-dialog.component.css',
})
export class BookDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<BookDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  readonly authorsStore = inject(AuthorsStore);
  readonly categoriesStore = inject(CategoriesStore);
  readonly data = inject<BookDialogData>(MAT_DIALOG_DATA);
  readonly isEditing = Boolean(this.data.book);

  readonly form = this.formBuilder.nonNullable.group({
    title: [this.data.book?.title ?? '', [Validators.required, Validators.maxLength(120)]],
    isbn: [this.data.book?.isbn ?? '', [Validators.required, Validators.maxLength(20)]],
    authorId: [this.data.book?.authorId ?? 0, Validators.min(1)],
    categoryId: [this.data.book?.categoryId ?? 0, Validators.min(1)],
    publisher: [this.data.book?.publisher ?? '', Validators.required],
    price: [this.data.book?.price ?? 0, [Validators.required, Validators.min(0)]],
    stock: [this.data.book?.stock ?? 0, [Validators.required, Validators.min(0)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const result: BookFormValue = {
      ...value,
      price: Number(value.price),
      stock: Number(value.stock),
    };
    this.dialogRef.close(result);
  }
}
