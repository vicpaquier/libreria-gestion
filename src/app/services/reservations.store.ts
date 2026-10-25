import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearReservaSolicitud, Reserva } from '../models/api';
@Injectable({ providedIn: 'root' })
export class ReservationsStore {
  private readonly http = inject(HttpClient);
  private readonly state = signal<Reserva[]>([]);
  readonly reservations = this.state.asReadonly();
  readonly error = signal<string | null>(null);
  setFromHistory(reservations: Reserva[]): void {
    this.state.set(reservations);
  }
  create(value: CrearReservaSolicitud): Observable<Reserva> {
    return this.http.post<Reserva>('/api/reservas', value);
  }
  attend(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`/api/reservas/${id}/atender`, null);
  }
  cancel(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`/api/reservas/${id}/cancelar`, null);
  }
}
