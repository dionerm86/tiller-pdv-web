export enum TipoPessoa {
  Fisica = 'Fisica',
  Juridica = 'Juridica'
}

export interface Cliente {
  id?: number;
  nome: string;
  tipoPessoa: TipoPessoa;
  cpf_CNPJ?: string;
  rg_IE?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  dataNascimento?: Date;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  limiteCredito?: number;
  observacoes?: string;
  ativo: boolean;
  dataCriacao?: Date;
}