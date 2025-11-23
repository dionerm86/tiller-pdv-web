import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Caixa } from '../model/caixa.model';

// DTO para abertura de caixa (alinhado com o Backend C#)
export interface AbrirCaixaDto {
  valorInicial: number;
}

@Injectable({
  providedIn: 'root'
})
export class CaixaService {
  constructor(private api: ApiService) {}

  getCaixaAberto(): Observable<Caixa> {
    return this.api.get<Caixa>('caixa/aberto');
  }

  abrir(dto: AbrirCaixaDto): Observable<Caixa> {
    return this.api.post<Caixa>('caixa/abrir', dto);
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