import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'; // <--- Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { ProdutoService } from '../../core/services/produto.service';
import { VendaService } from '../../core/services/venda.service';
import { CaixaService } from '../../core/services/caixa.service';
import { BalancaService } from '../../core/services/balanca.service';

// Models
import { Produto } from '../../core/model/produto.model';
import { Cliente, ItemVenda, Venda } from '../../core/model/venda.model';
import { Caixa } from '../../core/model/caixa.model';
import { ImpressaoService } from 'src/app/core/services/impressao.service';

export enum FormaPagamentoId {
  Dinheiro = 1,
  CartaoDebito = 2,
  CartaoCredito = 3,
  Pix = 4,
  APrazo = 5,
  Multiplo = 6
}

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pdv.component.html',
  styleUrls: ['./pdv.component.scss']
})
export class PdvComponent implements OnInit, OnDestroy {
  @ViewChild('buscaInput') buscaInput!: ElementRef;

  caixaAberto: Caixa | null = null;
  loading = false;
  codigoBarras: string = '';
  termoBusca: string = '';
 clienteSelecionado: Cliente | null = null;
  formaPagamentoSelecionada: string = 'Dinheiro';
  valorPagoInput: number = 0;

  private vendaSubject: BehaviorSubject<Venda>;
  venda$: Observable<Venda>;

  get vendaAtual(): Venda {
    return this.vendaSubject.value;
  }

  private subscriptions: Subscription[] = [];

  constructor(
    private produtoService: ProdutoService,
    private vendaService: VendaService,
    private caixaService: CaixaService,
    private balancaService: BalancaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef, // <--- Injeção para forçar atualização da tela
    private impressaoService: ImpressaoService
  ) {
    const vendaInicial = this.criarVendaVazia();
    this.vendaSubject = new BehaviorSubject<Venda>(vendaInicial);
    this.venda$ = this.vendaSubject.asObservable();
  }

  ngOnInit(): void {
    this.verificarCaixa();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  criarVendaVazia(): Venda {
    return {
      caixaId: this.caixaAberto?.id || 0,
      valorBruto: 0,
      valorDesconto: 0,
      valorTotal: 0,
      formaPagamento: 'Dinheiro',
      formaPagamentoId: FormaPagamentoId.Dinheiro,
      itens: [],
      usuarioId: 0,
      valorPago: 0
    };
  }

  verificarCaixa(): void {
    const sub = this.caixaService.getCaixaAberto().subscribe({
      next: (caixa) => {
        this.caixaAberto = caixa;
        const venda = this.vendaAtual;
        if (venda.caixaId === 0 && caixa.id) {
            venda.caixaId = caixa.id;
            this.vendaSubject.next(venda);
        }
        setTimeout(() => this.buscaInput?.nativeElement.focus(), 100);
      },
      error: () => this.caixaAberto = null
    });
    this.subscriptions.push(sub);
  }

  // --- Busca e Adição ---

  buscarProdutoManual(): void {
    const termo = this.termoBusca.trim();
    if (!termo) return;

    this.setLoading(true);

    // 1. Tenta interpretar como código de balança
    const dadosBalanca = this.balancaService.interpretarCodigo(termo);

    if (dadosBalanca.isPesavel) {
      console.log('Detectado Balança:', dadosBalanca);
      // Fluxo Balança: Passamos o Valor Total (em Reais) lido da etiqueta
      this.buscarProdutoPorId(dadosBalanca.codigoProduto, dadosBalanca.valorTotal);

    } else if (/^\d+$/.test(termo)) {
      // 2. Fluxo EAN Padrão (Numérico)
      this.produtoService.getByCodigoBarras(termo)
        .pipe(finalize(() => this.setLoading(false)))
        .subscribe({
          next: (produto) => {
            console.log('Produto retornado API:', produto); // <--- LOG NO LUGAR CERTO

            if (produto) {
              this.processarProdutoEncontrado(produto);
              this.termoBusca = '';
            } else {
              this.buscarPorNome(termo);
            }
          },
          error: () => {
            this.buscarPorNome(termo);
          }
        });

    } else {
      // 3. Fluxo Texto (Nome)
      this.buscarPorNome(termo);
    }
  }

  private buscarProdutoPorId(id: number, valorTotalEtiqueta: number): void {
    this.produtoService.getById(id)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (produto) => {
          if (produto) {
            this.processarProdutoEncontrado(produto, valorTotalEtiqueta);
            this.termoBusca = '';
          } else {
            this.showMessage(`Produto ID ${id} não encontrado`, 'error');
          }
        },
        error: () => this.showMessage(`Erro ao buscar produto ID: ${id}`, 'error')
      });
  }

  private buscarPorNome(termo: string): void {
    this.produtoService.search(termo)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (produtos) => {
          if (produtos && produtos.length === 1) {
            this.processarProdutoEncontrado(produtos[0]);
            this.termoBusca = '';
          } else if (produtos && produtos.length > 1) {
            this.showMessage('Múltiplos produtos encontrados.', 'info');
          } else {
            this.showMessage('Produto não encontrado', 'error');
          }
        },
        error: () => this.showMessage('Erro ao buscar produto por nome', 'error')
      });
  }

  // Método centralizado para processar e tratar erros
  private processarProdutoEncontrado(produto: Produto, valorEtiqueta?: number): void {
    try {
      const item = this.prepararItemVenda(produto, valorEtiqueta);
      this.adicionarItemAoCarrinho(item);
    } catch (error) {
      console.error('Erro ao processar produto:', error);
      this.showMessage('Erro ao adicionar item: Verifique os dados do produto.', 'error');
    }
  }

  private prepararItemVenda(produto: Produto, valorEtiqueta?: number): ItemVenda {
    if (!produto) throw new Error('Produto nulo');

    const preco = Number(produto.precoVenda) || 0;
    const idProduto = Number(produto.id);

    // CORREÇÃO CRÍTICA: O Backend manda "KG" (String), não número.
    const unidadeRaw = String(produto.unidadeMedida || 'UN').toUpperCase().trim();

    // Verifica se é pesável baseado na string
    const isPesavel = ['KG', 'LT', 'MT'].includes(unidadeRaw);

    console.log(`Debug Cálculo: Produto=${produto.descricao}, Unidade=${unidadeRaw}, É Pesável?=${isPesavel}, ValorEtiqueta=${valorEtiqueta}`);

    let quantidade = 1;
    let subtotal = preco;

    // Se for pesável (KG) e tivermos um valor vindo da etiqueta (R$)
    if (isPesavel && valorEtiqueta !== undefined && valorEtiqueta > 0 && preco > 0) {
      // O subtotal é o valor da etiqueta (ex: R$ 5,00)
      subtotal = valorEtiqueta;

      // A quantidade (peso) é calculada: R$ 5,00 / R$ 20,00 = 0.250 Kg
      quantidade = valorEtiqueta / preco;

      // Arredonda para 3 casas decimais para evitar dízimas infinitas (0.33333)
      quantidade = parseFloat(quantidade.toFixed(3));
    }

    return {
      produtoId: idProduto,
      produto: produto,
      descricao: `${produto.descricao || 'Item'} (${unidadeRaw})`,
      quantidade: quantidade,
      precoUnitario: preco,
      valorDesconto: 0,
      subtotal: subtotal
    };
  }

  // Helper simples para mostrar texto na tela em vez de 0 ou 1
  private getUnidadeDescricao(id: number): string {
    switch (id) {
        case 0: return 'UN';
        case 1: return 'KG';
        case 2: return 'LT';
        case 3: return 'MT';
        case 4: return 'CX';
        case 5: return 'PC';
        default: return 'UN';
    }
  }

  adicionarItemAoCarrinho(item: ItemVenda): void {
    const venda = this.vendaSubject.value;

    // Garante array
    const itensAtuais = venda.itens || [];
    const novaListaItens = [...itensAtuais]; // Imutabilidade

    const itemExistente = novaListaItens.find(i => i.produtoId === item.produtoId);

    if (itemExistente) {
      itemExistente.quantidade += item.quantidade;
      itemExistente.subtotal = (itemExistente.quantidade * itemExistente.precoUnitario) - itemExistente.valorDesconto;
    } else {
      novaListaItens.push(item);
    }

    venda.itens = novaListaItens;
    this.atualizarEstadoVenda(venda);

    // Feedback visual
    this.showMessage(`${item.descricao} adicionado!`, 'success');
  }

  removerItem(index: number): void {
    const venda = this.vendaSubject.value;
    if (!venda.itens) return;

    const novaListaItens = [...venda.itens];
    novaListaItens.splice(index, 1);
    venda.itens = novaListaItens;

    this.atualizarEstadoVenda(venda);
    this.showMessage('Item removido');
  }

  calcularTotaisUsuario(): void {
    this.atualizarEstadoVenda(this.vendaSubject.value);
  }

  private atualizarEstadoVenda(venda: Venda): void {
    const itens = venda.itens || [];
    const subtotal = itens.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    venda.valorBruto = parseFloat(subtotal.toFixed(2));
    venda.valorTotal = Math.max(0, venda.valorBruto - (venda.valorDesconto || 0));

    // Emite novo estado
    this.vendaSubject.next({ ...venda });
  }

  // Helper para controlar o loading e forçar detecção de mudanças
  private setLoading(state: boolean): void {
    this.loading = state;
    this.cdr.detectChanges(); // <--- Força o Angular a ver a mudança no loading
  }

  // --- Finalização ---

  podeFinalizarVenda(venda: Venda | null): boolean {
    if (!venda || !venda.itens || venda.itens.length === 0) return false;
    if (this.formaPagamentoSelecionada === 'Dinheiro' && this.valorPagoInput < venda.valorTotal) return false;
    return true;
  }

  finalizarVenda(): void {
    if (!this.caixaAberto) {
        this.showMessage('Caixa Fechado!', 'error');
        return;
    }

    const venda = this.vendaSubject.value;
    // ... (preparação do objeto venda mantém igual) ...
    venda.caixaId = this.caixaAberto.id!;
    venda.formaPagamento = this.formaPagamentoSelecionada;
    venda.formaPagamentoId = (FormaPagamentoId as any)[this.formaPagamentoSelecionada] || 1;
    venda.valorPago = this.formaPagamentoSelecionada === 'Dinheiro' ? this.valorPagoInput : venda.valorTotal;
    venda.valorTroco = this.calcularTroco(venda);
    venda.status = 'Concluida';

    this.setLoading(true);

    this.vendaService.registrar(venda)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (vendaRetornada) => { // O backend deve retornar a venda com ID
          this.showMessage(`Venda concluída!`, 'success');

          // 3. CHAMA A IMPRESSÃO AQUI
          // Usamos 'vendaRetornada' se o backend devolver o ID gerado,
          // senão usamos 'venda' mesmo (mas sem ID na nota).
          // Recomendo mesclar os dados para garantir que a nota tenha tudo.
          const vendaParaImprimir = { ...venda, ...vendaRetornada };

          // Pergunta simples ou imprime direto? Normalmente imprime direto em PDV rápido.
          this.impressaoService.imprimirCupomNaoFiscal(vendaParaImprimir);

          this.limparVenda();
        },
        error: (e) => {
          console.error(e);
          this.showMessage(e.error?.message || 'Erro ao finalizar', 'error');
        }
      });
  }

  limparVenda(): void {
    const novaVenda = this.criarVendaVazia();
    this.clienteSelecionado = null; // <--- Limpa cliente visualmente
    this.valorPagoInput = 0;
    this.termoBusca = '';
    this.vendaSubject.next(novaVenda);
    setTimeout(() => this.buscaInput?.nativeElement.focus(), 100);
  }

  cancelarVenda(): void {
    this.limparVenda();
    this.showMessage('Venda cancelada');
  }

  abrirCaixa(): void {
    import('./abrir-caixa-dialog/abrir-caixa-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.AbrirCaixaDialogComponent, {
        width: '400px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(valorAbertura => {
        if (valorAbertura !== undefined && valorAbertura !== null) {

          const dto = { valorInicial: valorAbertura };

          this.caixaService.abrir(dto).subscribe({
            next: (c) => {
              this.caixaAberto = c;
              this.showMessage('Caixa aberto!', 'success');

              const venda = this.vendaAtual;
              venda.caixaId = c.id!;
              this.vendaSubject.next(venda);
            },
            error: (err) => {
              console.error(err);
              this.showMessage('Erro ao abrir caixa', 'error');
            }
          });
        }
      });
    });
  }

  calcularTroco(venda: Venda | null): number {
    if (!venda) return 0;
    return Math.max(0, this.valorPagoInput - venda.valorTotal);
  }

  abrirSelecaoCliente(): void {
    import('./selecionar-cliente-dialog/selecionar-cliente-dialog.component')
      .then(m => {
        const dialogRef = this.dialog.open(m.SelecionarClienteDialogComponent, {
          width: '500px',
          disableClose: false
        });

        dialogRef.afterClosed().subscribe((cliente: Cliente | null) => {
          // Se undefined, usuário fechou sem selecionar. Se null, clicou em "Não Identificar".
          if (cliente !== undefined) {
            this.definirCliente(cliente);
          }
        });
      });
  }

  // 2. Método auxiliar para atualizar o estado
  definirCliente(cliente: Cliente | null): void {
    this.clienteSelecionado = cliente;

    // Atualiza o objeto Venda
    const venda = this.vendaSubject.value;
    // Venda.clienteId espera number | undefined; use undefined quando não há cliente
    venda.clienteId = cliente?.id ?? undefined;
    venda.cliente = cliente ?? undefined; // Opcional, para exibição (garante undefined em vez de null)

    this.vendaSubject.next({ ...venda }); // Atualiza tela

    const msg = cliente ? `Cliente ${cliente.nome} vinculado!` : 'Venda sem cliente identificado.';
    this.showMessage(msg, 'info');
  }

  // 3. Atualize o setupKeyboardShortcuts para incluir o F5
  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        this.buscaInput?.nativeElement.focus();
      }
      else if (e.key === 'F5') { // <--- NOVO ATALHO
        e.preventDefault();
        this.abrirSelecaoCliente();
      }
      else if (e.key === 'F12') {
        e.preventDefault();
        if (this.podeFinalizarVenda(this.vendaAtual)) this.finalizarVenda();
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000, horizontalPosition: 'end', verticalPosition: 'top', panelClass: `snackbar-${type}`
    });
  }
}