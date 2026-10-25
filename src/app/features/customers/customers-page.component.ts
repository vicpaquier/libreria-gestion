import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { EstadoUsuario, HistorialUsuario, Usuario, UsuarioDetalle } from '../../models/api';
import { CustomersStore } from '../../services/customers.store';
import { errorMessage } from '../../services/http-error';
import { CustomerDialogComponent } from './customer-dialog.component';
@Component({
  selector: 'app-customers-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './customers-page.component.html',
  styleUrl: '../../shared/crud-page.css',
})
export class CustomersPageComponent {
  readonly store = inject(CustomersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly buscar = signal('');
  readonly estado = signal<EstadoUsuario | undefined>(undefined);
  readonly pending = signal(false);
  readonly columns = ['usuario', 'cedula', 'contacto', 'estado', 'acciones'];
  constructor() {
    this.load();
  }
  load(): void {
    this.store.load(this.page(), this.size(), this.buscar(), this.estado());
  }
  search(event: Event): void {
    this.buscar.set((event.target as HTMLInputElement).value);
    this.page.set(0);
    this.load();
  }
  filter(estado: EstadoUsuario | ''): void {
    this.estado.set(estado || undefined);
    this.page.set(0);
    this.load();
  }
  changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
    this.load();
  }
  create(): void {
    this.open();
  }
  detail(user: Usuario): void {
    this.store.get(user.id).subscribe({
      next: (data) => this.dialog.open(UserDetailDialog, { data, width: 'min(92vw, 52rem)' }),
      error: (error) =>
        this.notify(errorMessage(error, 'No se pudo cargar el detalle del usuario.')),
    });
  }
  history(user: Usuario): void {
    this.store.history(user.id).subscribe({
      next: (data) => this.dialog.open(UserHistoryDialog, { data, width: 'min(92vw, 52rem)' }),
      error: (error) =>
        this.notify(errorMessage(error, 'No se pudo cargar el historial del usuario.')),
    });
  }
  edit(user: Usuario): void {
    this.open(user);
  }
  toggle(user: Usuario): void {
    if (this.pending()) return;
    const estado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.pending.set(true);
    this.store
      .changeStatus(user.id, estado)
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: () => this.notify(`Usuario ${estado.toLowerCase()}.`),
        error: (e) => this.notify(errorMessage(e, 'No se pudo cambiar el estado.')),
      });
  }
  private open(user?: Usuario): void {
    this.dialog
      .open(CustomerDialogComponent, { data: { customer: user }, width: 'min(92vw,46rem)' })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;
        const request = user
          ? this.store.update(user.id, {
              nombre: value.nombre,
              apellido: value.apellido,
              email: value.email,
              telefono: value.telefono,
              direccion: value.direccion,
            })
          : this.store.add({ ...value, cedula: value.cedula! });
        if (this.pending()) return;
        this.pending.set(true);
        request.pipe(finalize(() => this.pending.set(false))).subscribe({
          next: () => this.notify(user ? 'Usuario actualizado.' : 'Usuario creado.'),
          error: (e) => this.notify(errorMessage(e, 'No se pudo guardar el usuario.')),
        });
      });
  }
  private notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 3500 });
  }
}

@Component({
  selector: 'app-user-detail-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template:
    '<h2 mat-dialog-title>{{data.nombre}} {{data.apellido}}</h2><mat-dialog-content><p><strong>Cédula:</strong> {{data.cedula}} · {{data.estado}}</p><p><strong>Préstamos:</strong> {{data.prestamos.length}}</p><p><strong>Reservas:</strong> {{data.reservas.length}}</p><p><strong>Multas:</strong> {{data.multas.length}}</p></mat-dialog-content><mat-dialog-actions align="end"><button matButton mat-dialog-close>Cerrar</button></mat-dialog-actions>',
})
export class UserDetailDialog {
  readonly data = inject<UsuarioDetalle>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-user-history-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template:
    '<h2 mat-dialog-title>Historial</h2><mat-dialog-content><p><strong>Préstamos:</strong> {{data.prestamos.length}}</p><p><strong>Reservas:</strong> {{data.reservas.length}}</p><p><strong>Multas:</strong> {{data.multas.length}}</p></mat-dialog-content><mat-dialog-actions align="end"><button matButton mat-dialog-close>Cerrar</button></mat-dialog-actions>',
})
export class UserHistoryDialog {
  readonly data = inject<HistorialUsuario>(MAT_DIALOG_DATA);
}
