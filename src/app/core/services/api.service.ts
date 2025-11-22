import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

get<T>(endpoint: string, params?: any, responseType?: 'json'): Observable<T>;
get<T>(endpoint: string, params?: any, responseType?: 'blob'): Observable<Blob>;
get<T>(endpoint: string, params?: any, responseType: 'json' | 'blob' = 'json'): Observable<any> {
  let httpParams = new HttpParams();

  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.append(key, params[key].toString());
      }
    });
  }

  const options: any = { params: httpParams };

  if (responseType === 'blob') {
    options.responseType = 'blob';
    return this.http.get<Blob>(`${this.baseUrl}/${endpoint}`, options);
  }

  // responseType === 'json'
  return this.http.get<T>(`${this.baseUrl}/${endpoint}`, options);
}


  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
}