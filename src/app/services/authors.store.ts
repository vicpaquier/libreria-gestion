import { Injectable, computed, signal } from '@angular/core';
import { Author, AuthorFormValue } from '../models/author';

const INITIAL_AUTHORS: Author[] = [
  {
    id: 1,
    name: 'Gabriel García Márquez',
    nationality: 'Colombia',
    biography: 'Novelista, cuentista y periodista, referente del realismo mágico.',
  },
  {
    id: 2,
    name: 'Antoine de Saint-Exupéry',
    nationality: 'Francia',
    biography: 'Escritor y aviador francés, autor de El principito.',
  },
  {
    id: 3,
    name: 'Yuval Noah Harari',
    nationality: 'Israel',
    biography: 'Historiador y ensayista especializado en historia global.',
  },
  {
    id: 4,
    name: 'Carlos Ruiz Zafón',
    nationality: 'España',
    biography: 'Novelista español conocido por la saga El Cementerio de los Libros Olvidados.',
  },
  {
    id: 5,
    name: 'George Orwell',
    nationality: 'Reino Unido',
    biography: 'Novelista y ensayista reconocido por su crítica política y social.',
  },
  {
    id: 6,
    name: 'Patrick Rothfuss',
    nationality: 'Estados Unidos',
    biography: 'Escritor estadounidense de literatura fantástica.',
  },
  {
    id: 7,
    name: 'Jane Austen',
    nationality: 'Reino Unido',
    biography: 'Novelista británica destacada por su retrato de la sociedad georgiana.',
  },
  {
    id: 8,
    name: 'Sun Tzu',
    nationality: 'China',
    biography: 'Estratega y filósofo de la antigua China.',
  },
  {
    id: 9,
    name: 'Julio Cortázar',
    nationality: 'Argentina',
    biography: 'Escritor argentino, figura central del boom latinoamericano.',
  },
  {
    id: 10,
    name: 'Frank Herbert',
    nationality: 'Estados Unidos',
    biography: 'Escritor de ciencia ficción y creador de la saga Dune.',
  },
  {
    id: 11,
    name: 'Victor Hugo',
    nationality: 'Francia',
    biography: 'Poeta, dramaturgo y novelista del romanticismo francés.',
  },
  {
    id: 12,
    name: 'Stephen Hawking',
    nationality: 'Reino Unido',
    biography: 'Físico teórico y divulgador científico británico.',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthorsStore {
  private readonly authorsState = signal<Author[]>(INITIAL_AUTHORS);

  readonly authors = this.authorsState.asReadonly();
  readonly totalAuthors = computed(() => this.authorsState().length);

  add(author: AuthorFormValue): void {
    const id = Math.max(0, ...this.authorsState().map((item) => item.id)) + 1;
    this.authorsState.update((authors) => [...authors, { ...author, id }]);
  }

  update(id: number, changes: AuthorFormValue): void {
    this.authorsState.update((authors) =>
      authors.map((author) => (author.id === id ? { ...changes, id } : author)),
    );
  }

  remove(id: number): void {
    this.authorsState.update((authors) => authors.filter((author) => author.id !== id));
  }
}
