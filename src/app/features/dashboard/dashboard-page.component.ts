import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ResumenDashboard } from '../../models/api';
import { DashboardService } from '../../services/dashboard.service';
@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, MatCardModule, MatIconModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent {
  private readonly service = inject(DashboardService);
  readonly summary = signal<ResumenDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  constructor() {
    this.service.getSummary().subscribe({
      next: (value) => {
        this.summary.set(value);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen del dashboard.');
        this.loading.set(false);
      },
    });
  }
}
