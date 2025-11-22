export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produtoDescricao: string;
  tipoMovimento: 'Entrada' | 'Saida' | 'Ajuste' | 'Devolucao' | 'Perda';
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  motivo?: string;
  documentoReferencia?: string;
  usuarioNome: string;
  dataHora: Date;
}

export interface ResumoEstoque {
  totalEntradas: number;
  totalSaidas: number;
  totalAjustes: number;
  totalDevolucoes: number;
  totalPerdas: number;
}