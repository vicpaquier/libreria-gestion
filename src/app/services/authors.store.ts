import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Autor, AutorSolicitud } from '../models/api';

@Injectable({ providedIn: 'root' })
export class AuthorsStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Autor[]>([]);
  readonly authors = this.state.asReadonly();
  readonly totalAuthors = computed(() => this.state().length);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  private currentSearch = '';

  load(buscar = ''): void {
    this.currentSearch = buscar;
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.error.set(null);
    const params = buscar.trim() ? new HttpParams().set('buscar', buscar.trim()) : undefined;
    this.http
      .get<Autor[]>('/api/autores', { params })
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (items) => version === this.requestVersion && this.state.set(items),
        error: () =>
          version === this.requestVersion && this.error.set('No se pudieron cargar los autores.'),
      });
  }
  add(value: AutorSolicitud): Observable<Autor> {
    return this.http.post<Autor>('/api/autores', value).pipe(tap(() => this.reload()));
  }
  update(id: number, value: AutorSolicitud): Observable<Autor> {
    return this.http.put<Autor>(`/api/autores/${id}`, value).pipe(tap(() => this.reload()));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/autores/${id}`).pipe(tap(() => this.reload()));
  }
  private reload(): void {
    this.load(this.currentSearch);
  }
}
