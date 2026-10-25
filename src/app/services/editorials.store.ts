import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Editorial, EditorialSolicitud } from '../models/api';
@Injectable({ providedIn: 'root' })
export class EditorialsStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Editorial[]>([]);
  readonly editorials = this.state.asReadonly();
  readonly total = computed(() => this.state().length);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  load(): void {
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.error.set(null);
    this.http
      .get<Editorial[]>('/api/editoriales')
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (items) => version === this.requestVersion && this.state.set(items),
        error: () =>
          version === this.requestVersion &&
          this.error.set('No se pudieron cargar las editoriales.'),
      });
  }
  add(value: EditorialSolicitud): Observable<Editorial> {
    return this.http.post<Editorial>('/api/editoriales', value).pipe(tap(() => this.load()));
  }
  update(id: number, value: EditorialSolicitud): Observable<Editorial> {
    return this.http.put<Editorial>(`/api/editoriales/${id}`, value).pipe(tap(() => this.load()));
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/editoriales/${id}`).pipe(tap(() => this.load()));
  }
}
