import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Libro, LibroDetalle, LibroSolicitud, Pagina } from '../models/api';

export interface FiltrosLibros {
  buscar?: string;
  autorId?: number;
  categoriaId?: number;
  editorialId?: number;
  anio?: number;
  disponible?: boolean;
}
@Injectable({ providedIn: 'root' })
export class BooksStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Libro[]>([]);
  readonly books = this.state.asReadonly();
  readonly totalBooks = computed(() => this.state().length);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  private currentPage = 0;
  private currentSize = 20;
  private currentFilters: FiltrosLibros = {};
  load(page = 0, size = 20, filters: FiltrosLibros = {}): void {
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
      .get<Pagina<Libro>>('/api/libros', { params })
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (version !== this.requestVersion) return;
          this.state.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () =>
          version === this.requestVersion && this.error.set('No se pudieron cargar los libros.'),
      });
  }
  add(value: LibroSolicitud & { cantidadTotal: number }): Observable<Libro> {
    return this.http.post<Libro>('/api/libros', value).pipe(tap(() => this.reload()));
  }
  update(id: number, value: LibroSolicitud): Observable<Libro> {
    const { cantidadTotal: _, ...request } = value;
    return this.http.put<Libro>(`/api/libros/${id}`, request).pipe(tap(() => this.reload()));
  }
  adjustStock(id: number, cantidadTotal: number): Observable<Libro> {
    return this.http
      .patch<Libro>(`/api/libros/${id}/stock`, { cantidadTotal })
      .pipe(tap(() => this.reload()));
  }
  get(id: number): Observable<LibroDetalle> {
    return this.http.get<LibroDetalle>(`/api/libros/${id}`);
  }
  private reload(): void {
    this.load(this.currentPage, this.currentSize, this.currentFilters);
  }
}
