import { Injectable } from '@angular/core';

export interface DadosBalanca {
  codigoProduto: number;
  valorTotal: number; // <--- Voltamos a chamar de Valor Total
  isPesavel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BalancaService {

  interpretarCodigo(codigoBarra: string): DadosBalanca {
    const codigo = codigoBarra ? codigoBarra.trim() : '';

    if (!codigo || !codigo.startsWith('2') || (codigo.length !== 12 && codigo.length !== 13)) {
      return { codigoProduto: 0, valorTotal: 0, isPesavel: false };
    }

    try {
      let codigoProduto: number;
      let valorTotalReais: number;

      // Extrai o Valor em Centavos (não mais peso em gramas)
      // Ex: 00500 -> 500 centavos -> R$ 5,00

      if (codigo.length === 12) {
        // Padrão 12: 2 CCCCC VVVVV D
        codigoProduto = parseInt(codigo.substring(1, 6), 10);
        const valorCentavos = parseInt(codigo.substring(6, 11), 10);
        valorTotalReais = valorCentavos / 100;
      } else {
        // Padrão 13: 2 CCCCC I VVVVV D
        codigoProduto = parseInt(codigo.substring(1, 6), 10);
        const valorCentavos = parseInt(codigo.substring(7, 12), 10);
        valorTotalReais = valorCentavos / 100;
      }

      return {
        codigoProduto,
        valorTotal: valorTotalReais,
        isPesavel: true
      };
    } catch {
      return { codigoProduto: 0, valorTotal: 0, isPesavel: false };
    }
  }
}