// Temporarily commented out to proceed with testing
/*
import { Observable, of } from 'rxjs';
import type { AxiosResponse } from 'axios';

export class MockHttpService {
  get<T = any>(url: string): Observable<AxiosResponse<T>> {
    return of({ data: {} } as AxiosResponse<T>);
  }

  post<T = any>(url: string, data?: any): Observable<AxiosResponse<T>> {
    return of({ data: {} } as AxiosResponse<T>);
  }

  put<T = any>(url: string, data?: any): Observable<AxiosResponse<T>> {
    return of({ data: {} } as AxiosResponse<T>);
  }

  delete<T = any>(url: string): Observable<AxiosResponse<T>> {
    return of({ data: {} } as AxiosResponse<T>);
  }

  patch<T = any>(url: string, data?: any): Observable<AxiosResponse<T>> {
    return of({ data: {} } as AxiosResponse<T>);
  }
}

export const mockHttpService = new MockHttpService();
*/ 