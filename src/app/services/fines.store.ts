import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { CrearMultaSolicitud, EstadoMulta, Multa, Pagina } from '../models/api';
export interface FiltrosMultas {
  usuarioId?: number;
  prestamoId?: number;
  estado?: EstadoMulta;
  fecha?: string;
}
@Injectable({ providedIn: 'root' })
export class FinesStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Multa[]>([]);
  readonly fines = this.state.asReadonly();
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  private currentPage = 0;
  private currentSize = 20;
  private currentFilters: FiltrosMultas = {};
  load(page = 0, size = 20, filters: FiltrosMultas = {}): void {
    this.currentPage = page;
    this.currentSize = size;
    this.currentFilters = { ...filters };
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams().set('page', page).set('size', size);
    for (const [key, value] of Object.entries(filters))
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    this.http
      .get<Pagina<Multa>>('/api/multas', { params })
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (version !== this.requestVersion) return;
          this.state.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () =>
          version === this.requestVersion && this.error.set('No se pudieron cargar las multas.'),
      });
  }
  create(value: CrearMultaSolicitud): Observable<Multa> {
    return this.http.post<Multa>('/api/multas', value).pipe(tap(() => this.reload()));
  }
  pay(id: number): Observable<Multa> {
    return this.http.patch<Multa>(`/api/multas/${id}/pagar`, null).pipe(tap(() => this.reload()));
  }
  cancel(id: number): Observable<Multa> {
    return this.http
      .patch<Multa>(`/api/multas/${id}/cancelar`, null)
      .pipe(tap(() => this.reload()));
  }
  private reload(): void {
    this.load(this.currentPage, this.currentSize, this.currentFilters);
  }
}
