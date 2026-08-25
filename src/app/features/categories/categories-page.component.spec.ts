import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesPageComponent } from './categories-page.component';

describe('CategoriesPageComponent', () => {
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    dialog.open.mockReset();
    snackBar.open.mockReset();
    TestBed.configureTestingModule({ imports: [CategoriesPageComponent] });
    TestBed.overrideComponent(CategoriesPageComponent, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      },
    });
  });

  it('renders the categories table', () => {
    const fixture = TestBed.createComponent(CategoriesPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('table')).toBeTruthy();
    expect(fixture.componentInstance.filteredCategories().length).toBe(10);
  });

  it('blocks deletion when the category has associated books', () => {
    const component = TestBed.createComponent(CategoriesPageComponent).componentInstance;
    component.confirmDelete(component.categoriesStore.categories()[0]);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('2 libros asociados'),
      'Cerrar',
      expect.anything(),
    );
  });
});
