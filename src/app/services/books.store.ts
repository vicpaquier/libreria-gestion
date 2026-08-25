import { Injectable, computed, signal } from '@angular/core';
import { Book, BookFormValue } from '../models/book';

const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: 'Cien años de soledad',
    isbn: '978-0307474728',
    authorId: 1,
    categoryId: 1,
    publisher: 'Vintage Español',
    price: 18.9,
    stock: 12,
    status: 'Disponible',
  },
  {
    id: 2,
    title: 'El principito',
    isbn: '978-0156012195',
    authorId: 2,
    categoryId: 2,
    publisher: 'Mariner Books',
    price: 12.5,
    stock: 8,
    status: 'Disponible',
  },
  {
    id: 3,
    title: 'Sapiens',
    isbn: '978-0062316097',
    authorId: 3,
    categoryId: 3,
    publisher: 'Harper Perennial',
    price: 24.95,
    stock: 3,
    status: 'Bajo stock',
  },
  {
    id: 4,
    title: 'La sombra del viento',
    isbn: '978-0143034902',
    authorId: 4,
    categoryId: 4,
    publisher: 'Penguin Books',
    price: 16.75,
    stock: 0,
    status: 'Agotado',
  },
  {
    id: 5,
    title: '1984',
    isbn: '978-0451524935',
    authorId: 5,
    categoryId: 5,
    publisher: 'Signet Classics',
    price: 10.99,
    stock: 15,
    status: 'Disponible',
  },
  {
    id: 6,
    title: 'El nombre del viento',
    isbn: '978-8401337208',
    authorId: 6,
    categoryId: 6,
    publisher: 'Plaza & Janés',
    price: 21.0,
    stock: 5,
    status: 'Bajo stock',
  },
  {
    id: 7,
    title: 'Orgullo y prejuicio',
    isbn: '978-0141439518',
    authorId: 7,
    categoryId: 7,
    publisher: 'Penguin Classics',
    price: 9.95,
    stock: 10,
    status: 'Disponible',
  },
  {
    id: 8,
    title: 'El arte de la guerra',
    isbn: '978-1590302255',
    authorId: 8,
    categoryId: 8,
    publisher: 'Shambhala',
    price: 14.4,
    stock: 2,
    status: 'Bajo stock',
  },
  {
    id: 9,
    title: 'Rayuela',
    isbn: '978-8437604572',
    authorId: 9,
    categoryId: 1,
    publisher: 'Cátedra',
    price: 19.5,
    stock: 7,
    status: 'Disponible',
  },
  {
    id: 10,
    title: 'Dune',
    isbn: '978-0441172719',
    authorId: 10,
    categoryId: 5,
    publisher: 'Ace Books',
    price: 17.8,
    stock: 0,
    status: 'Agotado',
  },
  {
    id: 11,
    title: 'Los miserables',
    isbn: '978-0451419439',
    authorId: 11,
    categoryId: 9,
    publisher: 'Signet Classics',
    price: 15.6,
    stock: 6,
    status: 'Disponible',
  },
  {
    id: 12,
    title: 'Breves respuestas a las grandes preguntas',
    isbn: '978-8491990237',
    authorId: 12,
    categoryId: 10,
    publisher: 'Crítica',
    price: 20.25,
    stock: 4,
    status: 'Bajo stock',
  },
];

@Injectable({ providedIn: 'root' })
export class BooksStore {
  private readonly booksState = signal<Book[]>(INITIAL_BOOKS);

  readonly books = this.booksState.asReadonly();
  readonly totalBooks = computed(() => this.booksState().length);

  add(book: BookFormValue): void {
    const id = Math.max(0, ...this.booksState().map((item) => item.id)) + 1;
    this.booksState.update((books) => [...books, this.withStatus({ ...book, id })]);
  }

  update(id: number, changes: BookFormValue): void {
    this.booksState.update((books) =>
      books.map((book) => (book.id === id ? this.withStatus({ ...changes, id }) : book)),
    );
  }

  remove(id: number): void {
    this.booksState.update((books) => books.filter((book) => book.id !== id));
  }

  adjustStock(id: number, amount: number): boolean {
    const book = this.booksState().find((item) => item.id === id);
    if (!book || book.stock + amount < 0) {
      return false;
    }

    this.booksState.update((books) =>
      books.map((item) =>
        item.id === id ? this.withStatus({ ...item, stock: item.stock + amount }) : item,
      ),
    );
    return true;
  }

  private withStatus(book: Omit<Book, 'status'>): Book {
    const status = book.stock === 0 ? 'Agotado' : book.stock <= 5 ? 'Bajo stock' : 'Disponible';
    return { ...book, status };
  }
}
