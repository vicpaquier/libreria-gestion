import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import {
  EstadoUsuario,
  HistorialUsuario,
  Pagina,
  Usuario,
  UsuarioDetalle,
  UsuarioSolicitud,
} from '../models/api';

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Usuario[]>([]);
  readonly customers = this.state.asReadonly();
  readonly totalCustomers = computed(() => this.state().length);
  readonly totalElements = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private requestVersion = 0;
  private currentPage = 0;
  private currentSize = 20;
  private currentSearch = '';
  private currentStatus?: EstadoUsuario;
  load(page = 0, size = 20, buscar = '', estado?: EstadoUsuario): void {
    this.currentPage = page;
    this.currentSize = size;
    this.currentSearch = buscar;
    this.currentStatus = estado;
    const version = ++this.requestVersion;
    this.loading.set(true);
    this.error.set(null);
    let params = new HttpParams().set('page', page).set('size', size);
    if (buscar.trim()) params = params.set('buscar', buscar.trim());
    if (estado) params = params.set('estado', estado);
    this.http
      .get<Pagina<Usuario>>('/api/usuarios', { params })
      .pipe(finalize(() => version === this.requestVersion && this.loading.set(false)))
      .subscribe({
        next: (result) => {
          if (version !== this.requestVersion) return;
          this.state.set(result.content);
          this.totalElements.set(result.totalElements);
        },
        error: () =>
          version === this.requestVersion && this.error.set('No se pudieron cargar los usuarios.'),
      });
  }
  add(value: UsuarioSolicitud & { cedula: string }): Observable<Usuario> {
    return this.http.post<Usuario>('/api/usuarios', value).pipe(tap(() => this.reload()));
  }
  update(id: number, value: Omit<UsuarioSolicitud, 'cedula'>): Observable<Usuario> {
    return this.http.put<Usuario>(`/api/usuarios/${id}`, value).pipe(tap(() => this.reload()));
  }
  changeStatus(id: number, estado: EstadoUsuario): Observable<Usuario> {
    return this.http
      .patch<Usuario>(`/api/usuarios/${id}/estado`, { estado })
      .pipe(tap(() => this.reload()));
  }
  get(id: number): Observable<UsuarioDetalle> {
    return this.http.get<UsuarioDetalle>(`/api/usuarios/${id}`);
  }
  history(id: number): Observable<HistorialUsuario> {
    return this.http.get<HistorialUsuario>(`/api/usuarios/${id}/historial`);
  }
  private reload(): void {
    this.load(this.currentPage, this.currentSize, this.currentSearch, this.currentStatus);
  }
}
