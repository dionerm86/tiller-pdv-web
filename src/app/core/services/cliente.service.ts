import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cliente } from '../model/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private endpoint = 'clientes';

  constructor(private api: ApiService) {}

  getAll(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>(this.endpoint);
  }

  getAtivos(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>(`${this.endpoint}/ativos`);
  }

  getById(id: number): Observable<Cliente> {
    return this.api.get<Cliente>(`${this.endpoint}/${id}`);
  }

  search(termo: string): Observable<Cliente[]> {
    return this.api.get<Cliente[]>(`${this.endpoint}/search/${termo}`);
  }

  getByCPF_CNPJ(documento: string): Observable<Cliente> {
    return this.api.get<Cliente>(`${this.endpoint}/cpf-cnpj/${documento}`);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.api.post<Cliente>(this.endpoint, cliente);
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    return this.api.put<Cliente>(`${this.endpoint}/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}