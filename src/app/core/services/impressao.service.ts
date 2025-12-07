import { Injectable } from '@angular/core';
import { Venda } from '../model/venda.model';

@Injectable({
  providedIn: 'root'
})
export class ImpressaoService {

  constructor() { }

  imprimirCupomNaoFiscal(venda: Venda): void {
    const conteudo = this.gerarHtmlCupom(venda);

    // Cria um iframe invisível para impressão
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(conteudo);
      doc.close();

      // Aguarda carregar o conteúdo e imprime
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Remove o iframe depois de um tempo para limpar a memória
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    }
  }

  private gerarHtmlCupom(venda: Venda): string {
    // Dados Fictícios da Empresa
    const empresa = {
      nome: 'TILLER PDV',
      cnpj: '14.631.787/0001-55',
      endereco: 'Rua das Flores, 123 - Centro'
    };

    const cliente = venda.cliente;
    const cpfCnpj = cliente?.cpf_CNPJ || 'Não informado';
    const nomeCliente = cliente?.nome || 'Consumidor Final';

    const dataHora = new Date().toLocaleString('pt-BR');

    let itensHtml = '';
    venda.itens.forEach(item => {
      // ... (Restante do loop de itens igual)
      const descricao = item.descricao || 'Item sem nome';
      const qtd = Number(item.quantidade) || 0;
      const preco = Number(item.precoUnitario) || 0;
      const totalItem = Number(item.subtotal) || 0;

      itensHtml += `
        <tr>
          <td colspan="3" class="item-desc">${descricao}</td>
        </tr>
        <tr>
          <td>${qtd.toFixed(3)} x R$ ${preco.toFixed(2)}</td>
          <td class="text-right">R$ ${totalItem.toFixed(2)}</td>
        </tr>
      `;
    });

    return `
      <html>
      <head>
        <title>Cupom Não Fiscal</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: 0; padding: 5px; width: 300px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { vertical-align: top; }
          .item-desc { font-weight: bold; padding-top: 4px; }
          .totais { margin-top: 10px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="text-center bold">
          ${empresa.nome}<br>
          CNPJ: ${empresa.cnpj}<br>
          ${empresa.endereco}
        </div>

        <div class="line"></div>
        <div class="text-center bold">CUPOM NÃO FISCAL</div>
        <div class="line"></div>

        <div>
          <span class="bold">CLIENTE:</span> ${nomeCliente}
        </div>
        <div>
          <span class="bold">CPF/CNPJ:</span> ${cpfCnpj}
        </div>
        <div class="line"></div>

        <div>Data: ${dataHora}</div>
        <div>Venda Nº: ${venda.id || 'NOVO'}</div>
        <div class="line"></div>

        <table>
          ${itensHtml}
        </table>

        <div class="line"></div>

        <table class="totais">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">R$ ${venda.valorBruto.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Desconto:</td>
            <td class="text-right">- R$ ${venda.valorDesconto.toFixed(2)}</td>
          </tr>
          <tr class="bold">
            <td>TOTAL A PAGAR:</td>
            <td class="text-right">R$ ${venda.valorTotal.toFixed(2)}</td>
          </tr>
        </table>

        <div class="line"></div>

        <table>
          <tr>
            <td>Pagamento (${venda.formaPagamento}):</td>
            <td class="text-right">R$ ${(venda.valorPago || venda.valorTotal).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Troco:</td>
            <td class="text-right">R$ ${(venda.valorTroco || 0).toFixed(2)}</td>
          </tr>
        </table>

        <div class="line"></div>
        <div class="text-center">
          Obrigado pela preferência!<br>
          Volte sempre.
        </div>
        <br><br>
      </body>
      </html>
    `;
  }
}