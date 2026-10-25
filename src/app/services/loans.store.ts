import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { CrearPrestamoSolicitud, EstadoPrestamo, Pagina, Prestamo } from '../models/api';

@Injectable({ providedIn: 'root' })
export class LoansStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Prestamo[]>([]);
  readonly loans = this.state.asReadonly();
  readonly activeLoans = computed(() =>
    this.state().filter((item) => item.estado === 'ACTIVO' || item.estado === 'ATRASADO'),
  );
  readonly returnedLoans = computed(() =>
    this.state().filter((item) => item.estado === 'DEVUELTO' || item.estado === 'CANCELADO'),
  );
  readonly totalActive = computed(() => this.activeLoans().length);
  readonly totalOverdue = computed(
    () => this.state().filter((item) => item.estado === 'ATRASADO').length,
  );
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  private currentPage = 0;
  private currentSize = 20;
  private currentStatus?: EstadoPrestamo;
  load(page = 0, size = 20, estado?: EstadoPrestamo): void {
    this.currentPage = page;
    this.currentSize = size;
    this.currentStatus = estado;
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams().set('page', page).set('size', size);
    if (estado) params = params.set('estado', estado);
    this.http
      .get<Pagina<Prestamo>>('/api/prestamos', { params })
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (version !== this.requestVersion) return;
          this.state.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () =>
          version === this.requestVersion && this.error.set('No se pudieron cargar los préstamos.'),
      });
  }
  register(value: CrearPrestamoSolicitud): Observable<Prestamo> {
    return this.http.post<Prestamo>('/api/prestamos', value).pipe(tap(() => this.reload()));
  }
  returnDetail(prestamoId: number, detalleId: number): Observable<Prestamo> {
    return this.http
      .post<Prestamo>(`/api/prestamos/${prestamoId}/devoluciones/${detalleId}`, null)
      .pipe(tap(() => this.reload()));
  }
  markLost(prestamoId: number, detalleId: number): Observable<Prestamo> {
    return this.http
      .patch<Prestamo>(`/api/prestamos/${prestamoId}/detalles/${detalleId}/perdido`, null)
      .pipe(tap(() => this.reload()));
  }
  private reload(): void {
    this.load(this.currentPage, this.currentSize, this.currentStatus);
  }
}
