import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResumenDashboard } from '../models/api';
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  getSummary(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>('/api/dashboard/resumen');
  }
}
