export interface Category {
  id: number;
  name: string;
  description: string;
}

export type CategoryFormValue = Omit<Category, 'id'>;
