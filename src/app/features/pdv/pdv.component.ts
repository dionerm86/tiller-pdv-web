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
import { ItemVenda, Venda } from '../../core/model/venda.model';
import { Caixa } from '../../core/model/caixa.model';

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
    private cdr: ChangeDetectorRef // <--- Injeção para forçar atualização da tela
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

    // 1. Verifica se é um código de Balança (Começa com 2 e tem 12 ou 13 dígitos numéricos)
    const dadosBalanca = this.balancaService.interpretarCodigo(termo);

    if (dadosBalanca.isPesavel) {
      // Fluxo Balança
      this.buscarProdutoPorId(dadosBalanca.codigoProduto, dadosBalanca.valorTotal);
    
    } else if (/^\d+$/.test(termo)) { 
      // 2. É APENAS NÚMEROS? -> Busca por Código de Barras (EAN)
      this.produtoService.getByCodigoBarras(termo)
        .pipe(finalize(() => this.setLoading(false)))
        .subscribe({
          next: (produto) => {
            if (produto) {
              this.processarProdutoEncontrado(produto);
              this.termoBusca = '';
            } else {
              // Se retornou 200 OK mas null (caso raro), tenta por nome ou avisa
              this.buscarPorNome(termo);
            }
          },
          error: () => {
            // Se não achou o código (404), tenta buscar por nome (vai que o nome é um número...)
            this.buscarPorNome(termo);
          }
        });

    } else {
      // 3. CONTÉM LETRAS? -> Busca Direta por Nome (Pula o erro de código de barras)
      // Aqui resolvemos o problema do "Feijão"
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
    
    // CORREÇÃO AQUI:
    // O Backend manda números: 0 (UN), 1 (KG), 2 (LT), 3 (MT)
    const unidade = Number(produto.unidadeMedida); 
    
    // Lista de IDs que são pesáveis (1=KG, 2=LT, 3=MT)
    // Verifique no seu Enum do C# se LT e MT também devem ser fracionados
    const isPesavel = [1, 2, 3].includes(unidade);

    let quantidade = 1;
    let subtotal = preco;

    if (isPesavel && valorEtiqueta && valorEtiqueta > 0 && preco > 0) {
      quantidade = valorEtiqueta / preco;
      subtotal = valorEtiqueta;
    }
    
    // Para exibição na tela (transformar 1 em 'KG', 0 em 'UN')
    // Podemos criar um helper simples aqui ou usar um Pipe no futuro
    const unidadeDescricao = this.getUnidadeDescricao(unidade);

    return {
      produtoId: idProduto,
      produto: produto,
      // Adicionamos a unidade na descrição para facilitar conferencia visual
      descricao: `${produto.descricao || 'Item'} (${unidadeDescricao})`,
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
        this.showMessage('Caixa está fechado!', 'error');
        return;
    }

    const vendaAtual = this.vendaSubject.value;
    vendaAtual.caixaId = this.caixaAberto.id!;
    vendaAtual.formaPagamento = this.formaPagamentoSelecionada;
    vendaAtual.formaPagamentoId = (FormaPagamentoId as any)[this.formaPagamentoSelecionada] || 1;
    vendaAtual.valorPago = this.formaPagamentoSelecionada === 'Dinheiro' ? this.valorPagoInput : vendaAtual.valorTotal;
    vendaAtual.valorTroco = this.calcularTroco(vendaAtual);
    vendaAtual.status = 'Concluida';

    this.setLoading(true);
    
    this.vendaService.registrar(vendaAtual)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (vendaConcluida) => {
          this.showMessage(`Venda concluída!`, 'success');
          this.limparVenda();
        },
        error: (error) => {
          console.error(error);
          this.showMessage(error.error?.message || 'Erro ao finalizar venda', 'error');
        }
      });
  }

  limparVenda(): void {
    const novaVenda = this.criarVendaVazia();
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

  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F2') { e.preventDefault(); this.buscaInput?.nativeElement.focus(); }
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