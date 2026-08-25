import { Injectable, computed, signal } from '@angular/core';
import { Category, CategoryFormValue } from '../models/category';

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Novela', description: 'Narrativa literaria de ficción.' },
  { id: 2, name: 'Infantil', description: 'Lecturas orientadas al público infantil.' },
  { id: 3, name: 'Historia', description: 'Obras sobre hechos y procesos históricos.' },
  { id: 4, name: 'Misterio', description: 'Relatos de intriga, suspense e investigación.' },
  {
    id: 5,
    name: 'Ciencia ficción',
    description: 'Ficción basada en avances científicos y futuros posibles.',
  },
  { id: 6, name: 'Fantasía', description: 'Mundos imaginarios, magia y aventuras.' },
  { id: 7, name: 'Romance', description: 'Historias centradas en relaciones sentimentales.' },
  { id: 8, name: 'Ensayo', description: 'Reflexión y análisis de temas diversos.' },
  { id: 9, name: 'Clásicos', description: 'Obras fundamentales de la literatura universal.' },
  { id: 10, name: 'Ciencia', description: 'Divulgación y conocimiento científico.' },
];

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly categoriesState = signal<Category[]>(INITIAL_CATEGORIES);

  readonly categories = this.categoriesState.asReadonly();
  readonly totalCategories = computed(() => this.categoriesState().length);

  add(category: CategoryFormValue): void {
    const id = Math.max(0, ...this.categoriesState().map((item) => item.id)) + 1;
    this.categoriesState.update((categories) => [...categories, { ...category, id }]);
  }

  update(id: number, changes: CategoryFormValue): void {
    this.categoriesState.update((categories) =>
      categories.map((category) => (category.id === id ? { ...changes, id } : category)),
    );
  }

  remove(id: number): void {
    this.categoriesState.update((categories) =>
      categories.filter((category) => category.id !== id),
    );
  }
}
