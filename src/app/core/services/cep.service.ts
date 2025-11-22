import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface EnderecoData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly API_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<EnderecoData | null> {
    // Remove formatação do CEP
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida CEP
    if (cepLimpo.length !== 8) {
      return of(null);
    }

    return this.http.get<CepResponse>(`${this.API_URL}/${cepLimpo}/json/`)
      .pipe(
        map(response => {
          // Se a API retornar erro
          if (response.erro) {
            return null;
          }

          return {
            logradouro: response.logradouro,
            bairro: response.bairro,
            cidade: response.localidade,
            estado: response.uf,
            cep: response.cep
          } as EnderecoData;
        }),
        catchError(error => {
          console.error('Erro ao buscar CEP:', error);
          return of(null);
        })
      );
  }

  validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }
}