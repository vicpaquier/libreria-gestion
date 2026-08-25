import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  const snackBar = { open: vi.fn() };

  beforeEach(() => {
    snackBar.open.mockReset();
    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
    });
    TestBed.overrideComponent(LoginPageComponent, {
      set: {
        providers: [{ provide: MatSnackBar, useValue: snackBar }],
      },
    });
  });

  it('rejects empty and malformed credentials', () => {
    const component = TestBed.createComponent(LoginPageComponent).componentInstance;

    component.submit();
    expect(component.loginForm.invalid).toBe(true);
    expect(component.showError('email')).toBe(true);
    expect(snackBar.open).not.toHaveBeenCalled();

    component.loginForm.setValue({ email: 'correo-invalido', password: '123', remember: false });
    expect(component.loginForm.controls.email.hasError('email')).toBe(true);
    expect(component.loginForm.controls.password.hasError('minlength')).toBe(true);
  });

  it('shows confirmation for valid credentials', () => {
    const component = TestBed.createComponent(LoginPageComponent).componentInstance;
    component.loginForm.setValue({
      email: 'lectora@example.com',
      password: 'secreto',
      remember: true,
    });

    component.submit();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Inicio de sesión simulado correctamente.',
      'Cerrar',
      expect.objectContaining({ duration: 3500 }),
    );
  });
});
