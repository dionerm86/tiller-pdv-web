import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LogAuditoria {
  id: number;
  usuarioNome: string;
  acao: string;
  tabela: string;
  detalhes: string;
  dataHora: Date;
  ipAddress: string;
}

export interface LogFilter {
  dataInicio?: Date;
  dataFim?: Date;
  usuarioId?: number;
  acao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private endpoint = 'logs';

  constructor(private api: ApiService, private http: HttpClient) {}

  // Usando a ApiService ou HttpClient direto para construir query params complexos
  getLogs(filtro: LogFilter): Observable<LogAuditoria[]> {
    let params = new HttpParams();
    
    if (filtro.dataInicio) 
      params = params.set('dataInicio', filtro.dataInicio.toISOString());
    
    if (filtro.dataFim) 
      params = params.set('dataFim', filtro.dataFim.toISOString());
    
    if (filtro.usuarioId) 
      params = params.set('usuarioId', filtro.usuarioId.toString());
      
    if (filtro.acao) 
      params = params.set('acao', filtro.acao);

    // Ajuste conforme sua ApiService. Se ela não aceitar HttpParams direto, use a string construída
    return this.api.get<LogAuditoria[]>(`${this.endpoint}?${params.toString()}`);
  }
}