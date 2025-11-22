import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  cpf: string;
  senha?: string;
  perfil: 'Admin' | 'Gerente' | 'Operador' | 'Vendedor';
  ativo: boolean;
  dataUltimoAcesso?: Date;
  dataCriacao?: Date;
}

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  perfil: string;
  ativo: boolean;
}

export interface AlterarSenhaDto {
  senhaAtual: string;
  senhaNova: string;
  confirmarSenha: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private endpoint = 'usuarios';

  constructor(private api: ApiService) {}

  getAll(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.endpoint);
  }

  getAtivos(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(`${this.endpoint}/ativos`);
  }

  getById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/${id}`);
  }

  create(usuario: CriarUsuarioDto): Observable<Usuario> {
    return this.api.post<Usuario>(this.endpoint, usuario);
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.endpoint}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  alterarSenha(id: number, dados: AlterarSenhaDto): Observable<void> {
    return this.api.post<void>(`${this.endpoint}/${id}/alterar-senha`, dados);
  }

  reativar(id: number): Observable<Usuario> {
    return this.api.post<Usuario>(`${this.endpoint}/${id}/reativar`, {});
  }
}