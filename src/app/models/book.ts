export type BookStatus = 'Disponible' | 'Bajo stock' | 'Agotado';

export interface Book {
  id: number;
  title: string;
  isbn: string;
  authorId: number;
  categoryId: number;
  publisher: string;
  price: number;
  stock: number;
  status: BookStatus;
}

export type BookFormValue = Omit<Book, 'id' | 'status'>;
