import { Usuario } from "./usuario.model";

export interface Caixa {
  id?: number;
  numeroSessao: number;
  usuarioAberturaId?: number;
  usuarioAbertura?: Usuario;
  dataAbertura: Date;
  valorAbertura: number;
  usuarioFechamentoId?: number;
  dataFechamento?: Date;
  valorFechamento?: number;
  valorDinheiro?: number;
  valorCartaoDebito?: number;
  valorCartaoCredito?: number;
  valorPix?: number;
  valorOutros?: number;
  totalVendas?: number;
  quantidadeVendas?: number;
  observacoes?: string;
  status: 'Aberto' | 'Fechado';
}