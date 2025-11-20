export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'Admin' | 'Gerente' | 'Operador' | 'Vendedor';
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}