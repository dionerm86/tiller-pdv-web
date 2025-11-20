import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Venda } from '../model/venda.model';

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  constructor(private api: ApiService) {}

  registrar(venda: Venda): Observable<Venda> {
    return this.api.post<Venda>('vendas', venda);
  }

  getById(id: number): Observable<Venda> {
    return this.api.get<Venda>(`vendas/${id}`);
  }

  getVendasHoje(): Observable<Venda[]> {
    return this.api.get<Venda[]>('vendas/hoje');
  }

  cancelar(id: number, motivo: string): Observable<Venda> {
    return this.api.post<Venda>(`vendas/${id}/cancelar`, { motivo });
  }
}