import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Categoria, CategoriaSolicitud } from '../models/api';

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Categoria[]>([]);
  readonly categories = this.state.asReadonly();
  readonly totalCategories = computed(() => this.state().length);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  load(): void {
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.error.set(null);
    this.http
      .get<Categoria[]>('/api/categorias')
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (items) => version === this.requestVersion && this.state.set(items),
        error: () =>
          version === this.requestVersion &&
          this.error.set('No se pudieron cargar las categorías.'),
      });
  }
  add(value: CategoriaSolicitud): Observable<Categoria> {
    return this.http.post<Categoria>('/api/categorias', value).pipe(tap(() => this.load()));
  }
  update(id: number, value: CategoriaSolicitud): Observable<Categoria> {
    return this.http.put<Categoria>(`/api/categorias/${id}`, value).pipe(tap(() => this.load()));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/categorias/${id}`).pipe(tap(() => this.load()));
  }
}
