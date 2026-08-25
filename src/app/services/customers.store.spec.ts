import { TestBed } from '@angular/core/testing';
import { CustomersStore } from './customers.store';

describe('CustomersStore', () => {
  it('creates, updates and removes customers', () => {
    const store = TestBed.inject(CustomersStore);
    const initialCount = store.totalCustomers();

    store.add({
      name: 'Laura Gómez',
      email: 'laura.gomez@example.com',
      phone: '+34 611 222 333',
      address: 'Calle Nueva 10, Madrid',
    });
    const customer = store.customers().at(-1)!;
    expect(store.totalCustomers()).toBe(initialCount + 1);

    store.update(customer.id, { ...customer, phone: '+34 699 888 777' });
    expect(store.customers().at(-1)?.phone).toBe('+34 699 888 777');

    store.remove(customer.id);
    expect(store.totalCustomers()).toBe(initialCount);
  });
});
