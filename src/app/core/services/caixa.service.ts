import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Caixa } from '../model/caixa.model';

@Injectable({
  providedIn: 'root'
})
export class CaixaService {
  constructor(private api: ApiService) {}

  getCaixaAberto(): Observable<Caixa> {
    return this.api.get<Caixa>('caixa/aberto');
  }

  abrir(valorAbertura: number): Observable<Caixa> {
    return this.api.post<Caixa>('caixa/abrir', { valorAbertura });
  }

  fechar(id: number): Observable<Caixa> {
    return this.api.post<Caixa>(`caixa/${id}/fechar`, {});
  }

  getHistorico(dataInicio?: Date, dataFim?: Date): Observable<Caixa[]> {
    const params: any = {};
    if (dataInicio) params.dataInicio = dataInicio.toISOString();
    if (dataFim) params.dataFim = dataFim.toISOString();
    return this.api.get<Caixa[]>('caixa/historico', params);
  }
}