import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard-page.component').then(
        (module) => module.DashboardPageComponent,
      ),
    title: 'Dashboard | Librería Gestión',
  },
  {
    path: 'libros',
    loadComponent: () =>
      import('./features/books/books-page.component').then((module) => module.BooksPageComponent),
    title: 'Libros | Librería Gestión',
  },
  {
    path: 'autores',
    loadComponent: () =>
      import('./features/authors/authors-page.component').then(
        (module) => module.AuthorsPageComponent,
      ),
    title: 'Autores | Librería Gestión',
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./features/categories/categories-page.component').then(
        (module) => module.CategoriesPageComponent,
      ),
    title: 'Categorías | Librería Gestión',
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/customers/customers-page.component').then(
        (module) => module.CustomersPageComponent,
      ),
    title: 'Clientes | Librería Gestión',
  },
  {
    path: 'prestamos',
    loadComponent: () =>
      import('./features/loans/loans-page.component').then((module) => module.LoansPageComponent),
    title: 'Préstamos y devoluciones | Librería Gestión',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login-page.component').then((module) => module.LoginPageComponent),
    title: 'Login | Librería Gestión',
  },
  { path: '**', redirectTo: 'dashboard' },
];
