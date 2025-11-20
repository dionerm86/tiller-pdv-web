import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Produto } from '../model/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Produto[]> {
    return this.api.get<Produto[]>('produtos');
  }

  getAtivos(): Observable<Produto[]> {
    return this.api.get<Produto[]>('produtos/ativos');
  }

  getById(id: number): Observable<Produto> {
    return this.api.get<Produto>(`produtos/${id}`);
  }

  getByCodigoBarras(codigo: string): Observable<Produto> {
    return this.api.get<Produto>(`produtos/codigo-barras/${codigo}`);
  }

  search(termo: string): Observable<Produto[]> {
    return this.api.get<Produto[]>(`produtos/search/${termo}`);
  }

  create(produto: Produto): Observable<Produto> {
  return this.api.post<Produto>('produtos', produto);
}

update(id: number, produto: Produto): Observable<Produto> {
  return this.api.put<Produto>(`produtos/${id}`, produto);
}

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`produtos/${id}`);
  }
}