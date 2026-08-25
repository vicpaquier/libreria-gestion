import { TestBed } from '@angular/core/testing';
import { AuthorsStore } from './authors.store';
import { CategoriesStore } from './categories.store';

describe('reference stores', () => {
  it('creates, updates and removes authors', () => {
    const store = TestBed.inject(AuthorsStore);
    const initialCount = store.totalAuthors();

    store.add({ name: 'Ursula K. Le Guin', nationality: 'Estados Unidos', biography: '' });
    const author = store.authors().at(-1)!;
    expect(store.totalAuthors()).toBe(initialCount + 1);

    store.update(author.id, { ...author, name: 'Ursula K. Le Guin (actualizada)' });
    expect(store.authors().at(-1)?.name).toContain('actualizada');

    store.remove(author.id);
    expect(store.totalAuthors()).toBe(initialCount);
  });

  it('creates, updates and removes categories', () => {
    const store = TestBed.inject(CategoriesStore);
    const initialCount = store.totalCategories();

    store.add({ name: 'Poesía', description: 'Obras escritas en verso.' });
    const category = store.categories().at(-1)!;
    expect(store.totalCategories()).toBe(initialCount + 1);

    store.update(category.id, { ...category, description: 'Poesía y verso.' });
    expect(store.categories().at(-1)?.description).toBe('Poesía y verso.');

    store.remove(category.id);
    expect(store.totalCategories()).toBe(initialCount);
  });
});
