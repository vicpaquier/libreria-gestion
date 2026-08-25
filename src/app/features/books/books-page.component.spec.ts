import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { BookFormValue } from '../../models/book';
import { BooksPageComponent } from './books-page.component';

describe('BooksPageComponent', () => {
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    dialog.open.mockReset();
    snackBar.open.mockReset();

    TestBed.configureTestingModule({
      imports: [BooksPageComponent],
    });
    TestBed.overrideComponent(BooksPageComponent, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      },
    });
  });

  it('renders the catalog with Material components', () => {
    const fixture = TestBed.createComponent(BooksPageComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('mat-card')).toHaveLength(1);
    expect(element.querySelectorAll('mat-chip').length).toBeGreaterThan(0);
    expect(element.querySelector('mat-paginator')).toBeTruthy();
  });

  it('shows Material feedback after creating a book', () => {
    const fixture = TestBed.createComponent(BooksPageComponent);
    const component = fixture.componentInstance;
    const book: BookFormValue = {
      title: 'El infinito en un junco',
      isbn: '978-8417860790',
      authorId: 1,
      categoryId: 8,
      publisher: 'Siruela',
      price: 24.95,
      stock: 9,
    };
    dialog.open.mockReturnValue({ afterClosed: () => of(book) });

    component.openCreateDialog();

    expect(component.booksStore.totalBooks()).toBe(13);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Libro creado correctamente.',
      'Cerrar',
      expect.objectContaining({ duration: 3500 }),
    );
  });

  it('blocks deletion when the book has loan history', () => {
    const component = TestBed.createComponent(BooksPageComponent).componentInstance;
    component.confirmDelete(component.booksStore.books()[0]);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'No se puede eliminar: el libro tiene historial de préstamos.',
      'Cerrar',
      expect.anything(),
    );
  });
});
