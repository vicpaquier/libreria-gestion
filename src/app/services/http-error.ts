import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api';

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiError> | null;
    return body?.mensaje || fallback;
  }
  return fallback;
}
