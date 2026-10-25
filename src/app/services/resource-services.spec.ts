import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CategoriesStore } from './categories.store';
import { AuthorsStore } from './authors.store';
import { BooksStore } from './books.store';
import { CustomersStore } from './customers.store';
import { DashboardService } from './dashboard.service';
import { EditorialsStore } from './editorials.store';
import { FinesStore } from './fines.store';
import { LoansStore } from './loans.store';
import { ReservationsStore } from './reservations.store';

const page = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
const user = {
  id: 1,
  nombre: 'Ana',
  apellido: 'Pérez',
  cedula: '123',
  email: null,
  telefono: null,
  direccion: null,
  fechaRegistro: '2026-01-01T00:00:00Z',
  estado: 'ACTIVO' as const,
};
const author = { id: 1, nombre: 'Ana', apellido: 'Pérez', nacionalidad: null };
const category = { id: 1, nombre: 'Novela', descripcion: null };
const editorial = { id: 1, nombre: 'Editorial', pais: null };
const book = {
  id: 1,
  titulo: 'Libro',
  isbn: null,
  anioPublicacion: null,
  numeroPaginas: null,
  cantidadTotal: 2,
  cantidadDisponible: 2,
  editorial: null,
  autores: [author],
  categorias: [category],
};
const fine = {
  id: 1,
  prestamoId: 1,
  monto: 100,
  motivo: 'Atraso',
  fechaMulta: '2026-01-01T00:00:00Z',
  estado: 'PENDIENTE' as const,
};
const loan = {
  id: 1,
  usuarioId: 1,
  fechaPrestamo: '2026-01-01T00:00:00Z',
  fechaVencimiento: '2026-01-10',
  estado: 'ACTIVO' as const,
  detalles: [],
  multas: [fine],
};
const reservation = {
  id: 1,
  usuarioId: 1,
  libro: { id: 1, titulo: 'Libro' },
  fechaReserva: '2026-01-01T00:00:00Z',
  estado: 'PENDIENTE' as const,
};

describe('resource HTTP services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function expectRequest(method: string, url: string, body?: unknown): void {
    const request = http.expectOne(url);
    expect(request.request.method).toBe(method);
    if (body !== undefined) expect(request.request.body).toEqual(body);
    request.flush(null);
  }

  function flushReload(url: string, response: unknown = []): void {
    const request = http.expectOne(
      (candidate) => candidate.url === url && candidate.method === 'GET',
    );
    request.flush(response as object);
  }

  it('covers the 6 user operations with contractual queries, bodies and verbs', () => {
    const store = TestBed.inject(CustomersStore);
    store.load(2, 10, ' ana ', 'ACTIVO');
    const list = http.expectOne((request) => request.url === '/api/usuarios');
    expect(list.request.method).toBe('GET');
    expect(list.request.params.get('page')).toBe('2');
    expect(list.request.params.get('size')).toBe('10');
    expect(list.request.params.get('buscar')).toBe('ana');
    expect(list.request.params.get('estado')).toBe('ACTIVO');
    list.flush({ ...page, page: 2, size: 10 });

    const createBody = {
      nombre: 'Ana',
      apellido: 'Pérez',
      cedula: '123',
      email: null,
      telefono: null,
      direccion: null,
    };
    store.add(createBody).subscribe();
    const create = http.expectOne('/api/usuarios');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(createBody);
    create.flush(user);
    flushReload('/api/usuarios', { ...page, page: 2, size: 10 });

    store.get(1).subscribe();
    expectRequest('GET', '/api/usuarios/1');

    const updateBody = {
      nombre: 'Ana',
      apellido: 'Pérez',
      email: null,
      telefono: null,
      direccion: null,
    };
    store.update(1, updateBody).subscribe();
    const update = http.expectOne('/api/usuarios/1');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(updateBody);
    update.flush(user);
    flushReload('/api/usuarios', { ...page, page: 2, size: 10 });

    store.changeStatus(1, 'INACTIVO').subscribe();
    const status = http.expectOne('/api/usuarios/1/estado');
    expect(status.request.method).toBe('PATCH');
    expect(status.request.body).toEqual({ estado: 'INACTIVO' });
    status.flush({ ...user, estado: 'INACTIVO' });
    flushReload('/api/usuarios', { ...page, page: 2, size: 10 });

    store.history(275).subscribe();
    expectRequest('GET', '/api/usuarios/275/historial');
  });

  it('covers the 4 author operations', () => {
    const store = TestBed.inject(AuthorsStore);
    store.load('ana');
    const list = http.expectOne((request) => request.url === '/api/autores');
    expect(list.request.method).toBe('GET');
    expect(list.request.params.get('buscar')).toBe('ana');
    list.flush([]);
    const body = { nombre: 'Ana', apellido: 'Pérez', nacionalidad: null };
    store.add(body).subscribe();
    const create = http.expectOne('/api/autores');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush(author);
    flushReload('/api/autores');
    store.update(1, body).subscribe();
    const update = http.expectOne('/api/autores/1');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(body);
    update.flush(author);
    flushReload('/api/autores');
    store.remove(1).subscribe();
    expectRequest('DELETE', '/api/autores/1');
    flushReload('/api/autores');
  });

  it('covers the 4 editorial operations', () => {
    const store = TestBed.inject(EditorialsStore);
    store.load();
    expectRequest('GET', '/api/editoriales');
    const body = { nombre: 'Editorial', pais: null };
    store.add(body).subscribe();
    const create = http.expectOne('/api/editoriales');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush(editorial);
    flushReload('/api/editoriales');
    store.update(1, body).subscribe();
    const update = http.expectOne('/api/editoriales/1');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(body);
    update.flush(editorial);
    flushReload('/api/editoriales');
    store.remove(1).subscribe();
    expectRequest('DELETE', '/api/editoriales/1');
    flushReload('/api/editoriales');
  });

  it('covers the 4 category operations', () => {
    const store = TestBed.inject(CategoriesStore);
    store.load();
    expectRequest('GET', '/api/categorias');
    const body = { nombre: 'Novela', descripcion: null };
    store.add(body).subscribe();
    const create = http.expectOne('/api/categorias');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush(category);
    flushReload('/api/categorias');
    store.update(1, body).subscribe();
    const update = http.expectOne('/api/categorias/1');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(body);
    update.flush(category);
    flushReload('/api/categorias');
    store.remove(1).subscribe();
    expectRequest('DELETE', '/api/categorias/1');
    flushReload('/api/categorias');
  });

  it('covers the 5 book operations and every list filter', () => {
    const store = TestBed.inject(BooksStore);
    store.load(1, 50, {
      buscar: 'sol',
      autorId: 1,
      categoriaId: 2,
      editorialId: 3,
      anio: 2020,
      disponible: false,
    });
    const list = http.expectOne((request) => request.url === '/api/libros');
    expect(list.request.method).toBe('GET');
    expectParams(list.request, {
      page: '1',
      size: '50',
      buscar: 'sol',
      autorId: '1',
      categoriaId: '2',
      editorialId: '3',
      anio: '2020',
      disponible: 'false',
    });
    list.flush({ ...page, page: 1, size: 50 });
    const createBody = {
      titulo: 'Libro',
      isbn: null,
      anioPublicacion: null,
      numeroPaginas: null,
      cantidadTotal: 2,
      editorialId: null,
      autoresIds: [1],
      categoriasIds: [1],
    };
    store.add(createBody).subscribe();
    const create = http.expectOne('/api/libros');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(createBody);
    create.flush(book);
    flushReload('/api/libros', { ...page, page: 1, size: 50 });
    store.get(1).subscribe();
    expectRequest('GET', '/api/libros/1');
    const updateBody = { ...createBody };
    store.update(1, updateBody).subscribe();
    const update = http.expectOne('/api/libros/1');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).not.toHaveProperty('cantidadTotal');
    update.flush(book);
    flushReload('/api/libros', { ...page, page: 1, size: 50 });
    store.adjustStock(1, 4).subscribe();
    const stock = http.expectOne('/api/libros/1/stock');
    expect(stock.request.method).toBe('PATCH');
    expect(stock.request.body).toEqual({ cantidadTotal: 4 });
    stock.flush({ ...book, cantidadTotal: 4, cantidadDisponible: 4 });
    flushReload('/api/libros', { ...page, page: 1, size: 50 });
  });

  it('covers the 4 loan operations and state filter', () => {
    const store = TestBed.inject(LoansStore);
    store.load(1, 10, 'ATRASADO');
    const list = http.expectOne((request) => request.url === '/api/prestamos');
    expect(list.request.method).toBe('GET');
    expectParams(list.request, { page: '1', size: '10', estado: 'ATRASADO' });
    list.flush({ ...page, page: 1, size: 10, content: [{ ...loan, estado: 'ATRASADO' }] });
    expect(store.loans()[0].multas).toEqual([fine]);
    const body = { usuarioId: 1, fechaVencimiento: '2026-01-10', librosIds: [1, 2] };
    store.register(body).subscribe();
    const create = http.expectOne('/api/prestamos');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush(loan);
    flushReload('/api/prestamos', { ...page, page: 1, size: 10 });
    store.returnDetail(1, 2).subscribe();
    const returned = http.expectOne('/api/prestamos/1/devoluciones/2');
    expect(returned.request.method).toBe('POST');
    expect(returned.request.body).toBeNull();
    returned.flush(loan);
    flushReload('/api/prestamos', { ...page, page: 1, size: 10 });
    store.markLost(1, 3).subscribe();
    const lost = http.expectOne('/api/prestamos/1/detalles/3/perdido');
    expect(lost.request.method).toBe('PATCH');
    expect(lost.request.body).toBeNull();
    lost.flush(loan);
    flushReload('/api/prestamos', { ...page, page: 1, size: 10 });
  });

  it('covers the 3 reservation operations', () => {
    const store = TestBed.inject(ReservationsStore);
    const body = { usuarioId: 1, libroId: 2 };
    store.create(body).subscribe();
    const create = http.expectOne('/api/reservas');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush(reservation);
    store.attend(1).subscribe();
    const attend = http.expectOne('/api/reservas/1/atender');
    expect(attend.request.method).toBe('PATCH');
    expect(attend.request.body).toBeNull();
    attend.flush({ ...reservation, estado: 'ATENDIDA' });
    store.cancel(1).subscribe();
    const cancel = http.expectOne('/api/reservas/1/cancelar');
    expect(cancel.request.method).toBe('PATCH');
    expect(cancel.request.body).toBeNull();
    cancel.flush({ ...reservation, estado: 'CANCELADA' });
  });

  it('covers the 4 fine operations and every list filter', () => {
    const store = TestBed.inject(FinesStore);
    store.load(2, 50, { usuarioId: 1, prestamoId: 2, estado: 'PENDIENTE', fecha: '2026-01-01' });
    const list = http.expectOne((request) => request.url === '/api/multas');
    expect(list.request.method).toBe('GET');
    expectParams(list.request, {
      page: '2',
      size: '50',
      usuarioId: '1',
      prestamoId: '2',
      estado: 'PENDIENTE',
      fecha: '2026-01-01',
    });
    list.flush({ ...page, page: 2, size: 50 });
    const body = { prestamoId: 1, monto: 100, motivo: 'Atraso' };
    store.create(body).subscribe();
    const create = http.expectOne('/api/multas');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(body);
    create.flush(fine);
    flushReload('/api/multas', { ...page, page: 2, size: 50 });
    store.pay(1).subscribe();
    const pay = http.expectOne('/api/multas/1/pagar');
    expect(pay.request.method).toBe('PATCH');
    expect(pay.request.body).toBeNull();
    pay.flush({ ...fine, estado: 'PAGADA' });
    flushReload('/api/multas', { ...page, page: 2, size: 50 });
    store.cancel(1).subscribe();
    const cancel = http.expectOne('/api/multas/1/cancelar');
    expect(cancel.request.method).toBe('PATCH');
    expect(cancel.request.body).toBeNull();
    cancel.flush({ ...fine, estado: 'CANCELADA' });
    flushReload('/api/multas', { ...page, page: 2, size: 50 });
  });

  it('covers the dashboard operation', () => {
    TestBed.inject(DashboardService).getSummary().subscribe();
    expectRequest('GET', '/api/dashboard/resumen');
  });

  it('ignores stale load responses without clearing the current loading state', () => {
    const store = TestBed.inject(BooksStore);
    store.load(0, 20, { buscar: 'anterior' });
    const previous = http.expectOne((request) => request.params.get('buscar') === 'anterior');
    store.load(0, 20, { buscar: 'vigente' });
    const current = http.expectOne((request) => request.params.get('buscar') === 'vigente');
    previous.flush({ ...page, content: [{ ...book, titulo: 'Anterior' }] });
    expect(store.loading()).toBe(true);
    expect(store.books()).toEqual([]);
    current.flush({ ...page, content: [{ ...book, titulo: 'Vigente' }] });
    expect(store.loading()).toBe(false);
    expect(store.books()[0].titulo).toBe('Vigente');
  });
});

function expectParams(request: HttpRequest<unknown>, expected: Record<string, string>): void {
  for (const [name, value] of Object.entries(expected)) {
    expect(request.params.get(name)).toBe(value);
  }
}
