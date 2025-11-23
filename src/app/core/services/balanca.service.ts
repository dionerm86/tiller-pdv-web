import { Injectable } from '@angular/core';

export interface DadosBalanca {
  codigoProduto: number; // O ID do produto (ex: 50)
  valorTotal: number;    // O valor em reais (ex: 5.00)
  isPesavel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BalancaService {

  constructor() { }

  /**
   * Analisa um código de barras EAN-13 e extrai informações se for de balança (prefixo 2).
   * Padrão utilizado: 2 CCCCC VVVVV D (12 dígitos de dados + 1 de verificação)
   */
  interpretarCodigo(codigoBarra: string): DadosBalanca {
    // 1. Validação estrita EAN-13 de Balança
    if (!codigoBarra || codigoBarra.length !== 13 || !codigoBarra.startsWith('2')) {
      return { codigoProduto: 0, valorTotal: 0, isPesavel: false };
    }

    try {
      // CCCCC (Produto ID): Posições 1 a 5 (índices 1 a 5)
      const codigoStr = codigoBarra.substring(1, 6); 
      const codigoProduto = parseInt(codigoStr, 10);

      // VVVVV (Valor em Centavos): Posições 6 a 10 (índices 6 a 10)
      const valorStr = codigoBarra.substring(6, 11); 
      const valorTotal = parseInt(valorStr, 10) / 100; // Divide por 100 para Reais

      // O dígito verificador (índice 11) é ignorado para o cálculo.

      return {
        codigoProduto,
        valorTotal,
        isPesavel: true
      };
    } catch (error) {
      console.error('Erro ao interpretar código de balança', error);
      return { codigoProduto: 0, valorTotal: 0, isPesavel: false };
    }
  }
}