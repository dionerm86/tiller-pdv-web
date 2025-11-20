export interface Produto {
  id?: number;
  codigoBarras?: string;
  codigoInterno?: string;
  descricao: string;
  descricaoDetalhada?: string;
  categoriaId: number;
  categoria?: Categoria;
  unidadeMedida: 'UN' | 'KG' | 'LT' | 'MT' | 'CX' | 'PC';
  precoCompra: number;
  precoVenda: number;
  margemLucro?: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo?: number;
  fornecedorId?: number;
  ncm?: string;
  cest?: string;
  cfop?: string;
  aliquotaICMS?: number;
  ativo: boolean;
  permiteDesconto: boolean;
  dataCriacao?: Date;
  dataUltimaAlteracao?: Date;
}

export interface Categoria {
  id?: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}