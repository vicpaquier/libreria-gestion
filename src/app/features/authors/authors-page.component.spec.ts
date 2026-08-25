import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthorsPageComponent } from './authors-page.component';

describe('AuthorsPageComponent', () => {
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    dialog.open.mockReset();
    snackBar.open.mockReset();
    TestBed.configureTestingModule({ imports: [AuthorsPageComponent] });
    TestBed.overrideComponent(AuthorsPageComponent, {
      set: {
        providers: [
          { provide: MatDialog, useValue: dialog },
          { provide: MatSnackBar, useValue: snackBar },
        ],
      },
    });
  });

  it('renders the authors table', () => {
    const fixture = TestBed.createComponent(AuthorsPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('table')).toBeTruthy();
    expect(fixture.componentInstance.filteredAuthors().length).toBe(12);
  });

  it('blocks deletion when the author has associated books', () => {
    const component = TestBed.createComponent(AuthorsPageComponent).componentInstance;
    component.confirmDelete(component.authorsStore.authors()[0]);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      expect.stringContaining('1 libro asociado'),
      'Cerrar',
      expect.anything(),
    );
  });
});
