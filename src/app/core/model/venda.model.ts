import { Produto } from "./produto.model";

export interface Venda {
  id?: number;
  numeroVenda?: string;
  caixaId: number;
  clienteId?: number;
  cliente?: Cliente;
  usuarioId?: number;
  dataHora?: Date;
  valorBruto: number;
  valorDesconto: number;
  percentualDesconto?: number;
  valorTotal: number;
  formaPagamento: 'Dinheiro' | 'CartaoDebito' | 'CartaoCredito' | 'Pix' | 'APrazo' | 'Multiplo';
  valorPago?: number;
  valorTroco?: number;
  status?: 'Concluida' | 'Cancelada' | 'Devolvida';
  observacoes?: string;
  itens: ItemVenda[];
  pagamentos?: PagamentoVenda[];
}

export interface ItemVenda {
  id?: number;
  vendaId?: number;
  produtoId: number;
  produto?: Produto;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  valorDesconto: number;
  subtotal: number;
}

export interface PagamentoVenda {
  formaPagamento: string;
  valor: number;
  nsu?: string;
  bandeira?: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  tipoPessoa: 'Fisica' | 'Juridica';
  cpf_CNPJ?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
}