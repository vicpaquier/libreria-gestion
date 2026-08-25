import { Injectable, computed, signal } from '@angular/core';
import { Customer, CustomerFormValue } from '../models/customer';

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    phone: '+34 612 345 678',
    address: 'Calle Mayor 18, Madrid',
  },
  {
    id: 2,
    name: 'Carlos Sánchez',
    email: 'carlos.sanchez@example.com',
    phone: '+34 623 456 789',
    address: 'Avenida del Puerto 42, Valencia',
  },
  {
    id: 3,
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@example.com',
    phone: '+34 634 567 890',
    address: 'Calle Sierpes 11, Sevilla',
  },
  {
    id: 4,
    name: 'David López',
    email: 'david.lopez@example.com',
    phone: '+34 645 678 901',
    address: 'Gran Via de les Corts 215, Barcelona',
  },
  {
    id: 5,
    name: 'Marta García',
    email: 'marta.garcia@example.com',
    phone: '+34 656 789 012',
    address: 'Paseo Independencia 30, Zaragoza',
  },
  {
    id: 6,
    name: 'Javier Romero',
    email: 'javier.romero@example.com',
    phone: '+34 667 890 123',
    address: 'Calle Larios 7, Málaga',
  },
  {
    id: 7,
    name: 'Elena Torres',
    email: 'elena.torres@example.com',
    phone: '+34 678 901 234',
    address: 'Alameda de Recalde 26, Bilbao',
  },
  {
    id: 8,
    name: 'Pablo Navarro',
    email: 'pablo.navarro@example.com',
    phone: '+34 689 012 345',
    address: 'Rúa do Príncipe 15, Vigo',
  },
  {
    id: 9,
    name: 'Sara Moreno',
    email: 'sara.moreno@example.com',
    phone: '+34 690 123 456',
    address: 'Calle Uría 34, Oviedo',
  },
  {
    id: 10,
    name: 'Miguel Ruiz',
    email: 'miguel.ruiz@example.com',
    phone: '+34 601 234 567',
    address: 'Avenida Libertad 9, Murcia',
  },
];

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  private readonly customersState = signal<Customer[]>(INITIAL_CUSTOMERS);

  readonly customers = this.customersState.asReadonly();
  readonly totalCustomers = computed(() => this.customersState().length);

  add(customer: CustomerFormValue): void {
    const id = Math.max(0, ...this.customersState().map((item) => item.id)) + 1;
    this.customersState.update((customers) => [...customers, { ...customer, id }]);
  }

  update(id: number, changes: CustomerFormValue): void {
    this.customersState.update((customers) =>
      customers.map((customer) => (customer.id === id ? { ...changes, id } : customer)),
    );
  }

  remove(id: number): void {
    this.customersState.update((customers) => customers.filter((customer) => customer.id !== id));
  }
}
