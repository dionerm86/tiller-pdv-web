import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ProdutoService } from '../../core/services/produto.service';
import { VendaService } from '../../core/services/venda.service';
import { CaixaService } from '../../core/services/caixa.service';
import { Produto } from '../../core/model/produto.model';
import { ItemVenda, Venda } from '../../core/model/venda.model';
import { Caixa } from '../../core/model/caixa.model';

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
    MatChipsModule
  ],
  template: `
    <div class="pdv-container">
      <!-- Verificação de Caixa Aberto -->
      <mat-card *ngIf="!caixaAberto" class="caixa-fechado-card">
        <mat-card-header>
          <mat-icon class="warning-icon">warning</mat-icon>
          <mat-card-title>Caixa Fechado</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>É necessário abrir o caixa antes de iniciar as vendas.</p>
          <button mat-raised-button color="primary" (click)="abrirCaixa()">
            <mat-icon>account_balance_wallet</mat-icon>
            Abrir Caixa
          </button>
        </mat-card-content>
      </mat-card>

      <!-- PDV Principal -->
      <div *ngIf="caixaAberto" class="pdv-content">
        <!-- Coluna Esquerda: Busca e Lista -->
        <div class="pdv-left">
          <mat-card class="search-card">
            <mat-card-header>
              <mat-card-title>Buscar Produto</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Código de Barras / Nome</mat-label>
                <input matInput #buscaInput 
                       [(ngModel)]="termoBusca"
                       (keyup.enter)="buscarProduto()"
                       placeholder="Digite ou escaneie o código">
                <mat-icon matPrefix>search</mat-icon>
                <button mat-icon-button matSuffix (click)="buscarProduto()">
                  <mat-icon>send</mat-icon>
                </button>
              </mat-form-field>

              <div class="quick-actions">
                <button mat-stroked-button (click)="buscarPorCategoria()">
                  <mat-icon>category</mat-icon>
                  Categorias
                </button>
                <button mat-stroked-button (click)="limparBusca()">
                  <mat-icon>clear</mat-icon>
                  Limpar
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Lista de Itens da Venda -->
          <mat-card class="itens-card">
            <mat-card-header>
              <mat-card-title>Itens da Venda</mat-card-title>
              <span class="items-count">{{ itensVenda.length }} itens</span>
            </mat-card-header>
            <mat-card-content>
              <div class="itens-list">
                <div *ngIf="itensVenda.length === 0" class="empty-state">
                  <mat-icon>shopping_cart</mat-icon>
                  <p>Nenhum item adicionado</p>
                  <small>Escaneie ou busque produtos</small>
                </div>

                <div *ngFor="let item of itensVenda; let i = index" class="item-row">
                  <div class="item-info">
                    <strong>{{ item.descricao }}</strong>
                    <div class="item-details">
                      <span class="quantity">{{ item.quantidade }}x</span>
                      <span class="price">R$ {{ item.precoUnitario | number:'1.2-2' }}</span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <span class="subtotal">R$ {{ item.subtotal | number:'1.2-2' }}</span>
                    <button mat-icon-button (click)="editarItem(i)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="removerItem(i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Coluna Direita: Resumo e Pagamento -->
        <div class="pdv-right">
          <mat-card class="total-card">
            <mat-card-content>
              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span class="value">R$ {{ calcularSubtotal() | number:'1.2-2' }}</span>
                </div>
                <div class="total-row">
                  <span>Desconto:</span>
                  <span class="value discount">- R$ {{ desconto | number:'1.2-2' }}</span>
                </div>
                <mat-divider></mat-divider>
                <div class="total-row total-final">
                  <span>TOTAL:</span>
                  <span class="value-final">R$ {{ calcularTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="discount-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Desconto (R$)</mat-label>
                  <input matInput type="number" [(ngModel)]="desconto" min="0">
                  <mat-icon matPrefix>local_offer</mat-icon>
                </mat-form-field>
              </div>

              <div class="payment-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Forma de Pagamento</mat-label>
                  <mat-select [(ngModel)]="formaPagamento">
                    <mat-option value="Dinheiro">
                      <mat-icon>payments</mat-icon>
                      Dinheiro
                    </mat-option>
                    <mat-option value="CartaoDebito">
                      <mat-icon>credit_card</mat-icon>
                      Cartão Débito
                    </mat-option>
                    <mat-option value="CartaoCredito">
                      <mat-icon>credit_card</mat-icon>
                      Cartão Crédito
                    </mat-option>
                    <mat-option value="Pix">
                      <mat-icon>qr_code</mat-icon>
                      PIX
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field *ngIf="formaPagamento === 'Dinheiro'" appearance="outline" class="full-width">
                  <mat-label>Valor Pago</mat-label>
                  <input matInput type="number" [(ngModel)]="valorPago" min="0">
                  <span matPrefix>R$&nbsp;</span>
                </mat-form-field>

                <div *ngIf="formaPagamento === 'Dinheiro' && valorPago > 0" class="troco-info">
                  <mat-icon>attach_money</mat-icon>
                  <div>
                    <strong>Troco:</strong>
                    <span class="troco-valor">R$ {{ calcularTroco() | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="warn" 
                        (click)="cancelarVenda()"
                        [disabled]="itensVenda.length === 0">
                  <mat-icon>cancel</mat-icon>
                  Cancelar
                </button>

                <button mat-raised-button color="primary" 
                        (click)="finalizarVenda()"
                        [disabled]="!podeFinalizarVenda()"
                        class="finalizar-btn">
                  <mat-icon>check_circle</mat-icon>
                  Finalizar (F12)
                </button>
              </div>

              <div class="shortcuts-info">
                <mat-chip-set>
                  <mat-chip>F2 - Buscar</mat-chip>
                  <mat-chip>F5 - Desconto</mat-chip>
                  <mat-chip>F12 - Finalizar</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Info do Caixa -->
          <mat-card class="caixa-info-card">
            <mat-card-content>
              <div class="caixa-info">
                <mat-icon>account_balance_wallet</mat-icon>
                <div>
                  <strong>Caixa #{{ caixaAberto.numeroSessao }}</strong>
                  <small>Aberto às {{ caixaAberto.dataAbertura | date:'HH:mm' }}</small>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pdv-container {
      height: calc(100vh - 112px);
      overflow: hidden;
    }

    .caixa-fechado-card {
      text-align: center;
      padding: 40px;
      max-width: 500px;
      margin: 100px auto;
    }

    .caixa-fechado-card .warning-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ff9800;
      margin-bottom: 16px;
    }

    .pdv-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 16px;
      height: 100%;
    }

    .pdv-left,
    .pdv-right {
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }

    .search-card {
      flex-shrink: 0;
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .quick-actions button {
      flex: 1;
    }

    .itens-card {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .itens-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .items-count {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .itens-list {
      flex: 1;
      overflow-y: auto;
      max-height: calc(100vh - 400px);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }

    .item-row:hover {
      background: #f5f5f5;
    }

    .item-info {
      flex: 1;
    }

    .item-info strong {
      display: block;
      margin-bottom: 4px;
      color: #333;
    }

    .item-details {
      display: flex;
      gap: 12px;
      font-size: 14px;
      color: #666;
    }

    .quantity {
      font-weight: 600;
      color: #667eea;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subtotal {
      font-weight: 700;
      color: #333;
      min-width: 100px;
      text-align: right;
    }

    .total-card {
      flex-shrink: 0;
    }

    .total-section {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }

    .total-row.total-final {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      padding-top: 16px;
    }

    .value-final {
      color: #667eea;
    }

    .discount {
      color: #f44336;
    }

    .discount-section,
    .payment-section {
      margin-bottom: 16px;
    }

    .troco-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #e8f5e9;
      border-radius: 8px;
      margin-top: 16px;
    }

    .troco-info mat-icon {
      color: #4caf50;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .troco-valor {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #2e7d32;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .finalizar-btn {
      font-size: 16px;
      font-weight: 600;
      height: 56px;
    }

    .shortcuts-info {
      margin-top: 16px;
    }

    mat-chip {
      font-size: 11px;
    }

    .caixa-info-card {
      flex-shrink: 0;
    }

    .caixa-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .caixa-info mat-icon {
      color: #667eea;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class PdvComponent implements OnInit {
  @ViewChild('buscaInput') buscaInput!: ElementRef;

  caixaAberto: Caixa | null = null;
  itensVenda: ItemVenda[] = [];
  termoBusca = '';
  desconto = 0;
  formaPagamento: string = 'Dinheiro';
  valorPago = 0;

  constructor(
    private produtoService: ProdutoService,
    private vendaService: VendaService,
    private caixaService: CaixaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.verificarCaixa();
    this.setupKeyboardShortcuts();
  }

  verificarCaixa(): void {
    this.caixaService.getCaixaAberto().subscribe({
      next: (caixa) => {
        this.caixaAberto = caixa;
        setTimeout(() => this.buscaInput?.nativeElement.focus(), 100);
      },
      error: () => {
        this.caixaAberto = null;
      }
    });
  }

  abrirCaixa(): void {
    // Importar o dialog no topo do arquivo
    import('./abrir-caixa-dialog/abrir-caixa-dialog.component').then(m => {
      const dialogRef = this.dialog.open(m.AbrirCaixaDialogComponent, {
        width: '500px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(valorAbertura => {
        if (valorAbertura !== undefined && valorAbertura !== null) {
          this.caixaService.abrir(valorAbertura).subscribe({
            next: (caixa) => {
              this.caixaAberto = caixa;
              this.showMessage('Caixa aberto com sucesso!', 'success');
              setTimeout(() => this.buscaInput?.nativeElement.focus(), 100);
            },
            error: (error) => {
              this.showMessage(error.error?.message || 'Erro ao abrir caixa', 'error');
            }
          });
        }
      });
    });
  }

  buscarProduto(): void {
    if (!this.termoBusca.trim()) return;

    // Tentar buscar por código de barras primeiro
    this.produtoService.getByCodigoBarras(this.termoBusca).subscribe({
      next: (produto) => {
        this.adicionarProduto(produto);
        this.termoBusca = '';
      },
      error: () => {
        // Se não encontrar por código, buscar por nome
        this.produtoService.search(this.termoBusca).subscribe({
          next: (produtos) => {
            if (produtos.length === 1) {
              this.adicionarProduto(produtos[0]);
              this.termoBusca = '';
            } else if (produtos.length > 1) {
              // Abrir dialog para selecionar produto
              this.showMessage('Múltiplos produtos encontrados');
            } else {
              this.showMessage('Produto não encontrado', 'error');
            }
          }
        });
      }
    });
  }

  adicionarProduto(produto: Produto, quantidade: number = 1): void {
    const itemExistente = this.itensVenda.find(i => i.produtoId === produto.id);

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
      itemExistente.subtotal = itemExistente.quantidade * itemExistente.precoUnitario;
    } else {
      const novoItem: ItemVenda = {
        produtoId: produto.id!,
        produto: produto,
        descricao: produto.descricao,
        quantidade: quantidade,
        precoUnitario: produto.precoVenda,
        valorDesconto: 0,
        subtotal: quantidade * produto.precoVenda
      };
      this.itensVenda.push(novoItem);
    }

    this.showMessage(`${produto.descricao} adicionado!`, 'success');
  }

  removerItem(index: number): void {
    this.itensVenda.splice(index, 1);
    this.showMessage('Item removido');
  }

  editarItem(index: number): void {
    // Implementar dialog para editar quantidade/desconto do item
    this.showMessage('Função em desenvolvimento');
  }

  calcularSubtotal(): number {
    return this.itensVenda.reduce((total, item) => total + item.subtotal, 0);
  }

  calcularTotal(): number {
    return Math.max(0, this.calcularSubtotal() - this.desconto);
  }

  calcularTroco(): number {
    return Math.max(0, this.valorPago - this.calcularTotal());
  }

  podeFinalizarVenda(): boolean {
    if (this.itensVenda.length === 0) return false;
    if (this.formaPagamento === 'Dinheiro' && this.valorPago < this.calcularTotal()) return false;
    return true;
  }

  finalizarVenda(): void {
    const formaPagamentoMap: { [key: string]: FormarPagamento } = {
    'Dinheiro': FormarPagamento.Dinheiro,
    'CartaoDebito': FormarPagamento.CartaoDebito,
    'CartaoCredito': FormarPagamento.CartaoCredito,
    'Pix': FormarPagamento.Pix,
    'APrazo': FormarPagamento.APrazo,
    'Multiplo': FormarPagamento.Multiplo
  };

    const venda: Venda = {
      caixaId: this.caixaAberto!.id!,
      valorBruto: this.calcularSubtotal(),
      valorDesconto: this.desconto,
      valorTotal: this.calcularTotal(),
      formaPagamento: this.formaPagamento as any,
      formaPagamentoId: formaPagamentoMap[this.formaPagamento],
      valorPago: this.formaPagamento === 'Dinheiro' ? this.valorPago : undefined,
      itens: this.itensVenda.map(item => ({
        produtoId: item.produtoId,
        descricao: item.descricao,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        valorDesconto: item.valorDesconto,
        subtotal: item.subtotal
      }))
    };

    this.vendaService.registrar(venda).subscribe({
      next: (vendaConcluida) => {
        this.showMessage(`Venda #${vendaConcluida.numeroVenda} concluída!`, 'success');
        this.limparVenda();
      },
      error: (error) => {
        this.showMessage(error.error?.message || 'Erro ao finalizar venda', 'error');
      }
    });
  }

  cancelarVenda(): void {
    if (confirm('Deseja realmente cancelar esta venda?')) {
      this.limparVenda();
      this.showMessage('Venda cancelada');
    }
  }

  limparVenda(): void {
    this.itensVenda = [];
    this.desconto = 0;
    this.valorPago = 0;
    this.termoBusca = '';
    this.buscaInput?.nativeElement.focus();
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.buscaInput?.nativeElement.focus();
  }

  buscarPorCategoria(): void {
    this.showMessage('Função em desenvolvimento');
  }

  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        this.buscaInput?.nativeElement.focus();
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (this.podeFinalizarVenda()) {
          this.finalizarVenda();
        }
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: `snackbar-${type}`
    });
  }
}

enum FormarPagamento {
Dinheiro,
CartaoDebito,
CartaoCredito,
Pix,
APrazo,
Multiplo
}