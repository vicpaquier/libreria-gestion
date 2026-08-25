export interface Author {
  id: number;
  name: string;
  nationality: string;
  biography: string;
}

export type AuthorFormValue = Omit<Author, 'id'>;
