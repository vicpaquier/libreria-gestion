import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Editorial, EditorialSolicitud } from '../../models/api';
import { EditorialsStore } from '../../services/editorials.store';
import { errorMessage } from '../../services/http-error';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
@Component({
  selector: 'app-editorials-page',
  imports: [MatButtonModule, MatCardModule, MatDialogModule, MatSnackBarModule, MatTableModule],
  template:
    '<main class="page-content"><section class="page-heading"><h1>Editoriales</h1><button matButton="filled" (click)="open()">Nueva editorial</button></section><mat-card class="table-card" appearance="outlined"><mat-card-content>@if(store.loading()){<p role="status">Cargando editoriales...</p>}@if(store.error()){<p role="alert">{{store.error()}}</p>}<table mat-table [dataSource]="store.editorials()"><ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef>Nombre</th><td mat-cell *matCellDef="let e">{{e.nombre}}</td></ng-container><ng-container matColumnDef="pais"><th mat-header-cell *matHeaderCellDef>País</th><td mat-cell *matCellDef="let e">{{e.pais||"Sin indicar"}}</td></ng-container><ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef>Acciones</th><td mat-cell *matCellDef="let e"><button matButton (click)="open(e)">Editar</button><button matButton (click)="remove(e)">Eliminar</button></td></ng-container><tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row;columns:columns"></tr></table></mat-card-content></mat-card></main>',
  styleUrl: '../../shared/crud-page.css',
})
export class EditorialsPageComponent {
  readonly store = inject(EditorialsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  readonly columns = ['nombre', 'pais', 'acciones'];
  constructor() {
    this.store.load();
  }
  open(editorial?: Editorial): void {
    this.dialog
      .open(EditorialDialog, { data: { editorial } })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;
        const req = editorial ? this.store.update(editorial.id, value) : this.store.add(value);
        req.subscribe({
          next: () => this.notify('Editorial guardada.'),
          error: (e) => this.notify(errorMessage(e, 'No se pudo guardar.')),
        });
      });
  }
  remove(editorial: Editorial): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Eliminar editorial',
          message: `¿Eliminar ${editorial.nombre}? Los libros quedarán sin editorial.`,
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok)
          this.store.remove(editorial.id).subscribe({
            next: () => this.notify('Editorial eliminada.'),
            error: (e) => this.notify(errorMessage(e, 'No se pudo eliminar.')),
          });
      });
  }
  private notify(m: string): void {
    this.snack.open(m, 'Cerrar', { duration: 3500 });
  }
}
@Component({
  selector: 'app-editorial-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template:
    '<h2 mat-dialog-title>Editorial</h2><mat-dialog-content><form [formGroup]="form"><mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="nombre" /></mat-form-field><mat-form-field appearance="outline"><mat-label>País</mat-label><input matInput formControlName="pais" /></mat-form-field></form></mat-dialog-content><mat-dialog-actions align="end"><button matButton mat-dialog-close>Cancelar</button><button matButton="filled" (click)="submit()">Guardar</button></mat-dialog-actions>',
})
export class EditorialDialog {
  private readonly ref = inject(MatDialogRef<EditorialDialog>);
  private readonly fb = inject(FormBuilder);
  readonly data = inject<{ editorial?: Editorial }>(MAT_DIALOG_DATA);
  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.editorial?.nombre ?? '', Validators.required],
    pais: [this.data.editorial?.pais ?? ''],
  });
  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result: EditorialSolicitud = { nombre: v.nombre, pais: v.pais.trim() || null };
    this.ref.close(result);
  }
}
