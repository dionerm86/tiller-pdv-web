// fechar-caixa-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Caixa } from '../../../core/model/caixa.model';

@Component({
  selector: 'app-fechar-caixa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-header">
      <h2>
        <mat-icon>lock</mat-icon>
        Fechar Caixa
      </h2>
    </div>

    <mat-dialog-content>
      <div class="alert-warning">
        <mat-icon>info</mat-icon>
        <div>
          <p><strong>Atenção!</strong></p>
          <p>Você está prestes a fechar o caixa <strong>#{{ caixa.numeroSessao }}</strong>.</p>
        </div>
      </div>

      <div class="caixa-info">
        <div class="info-row">
          <span class="label">Abertura:</span>
          <span>{{ caixa.dataAbertura | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Operador:</span>
          <span>{{ caixa.usuarioAbertura?.nome }}</span>
        </div>
        <div class="info-row">
          <span class="label">Valor Abertura:</span>
          <span>R$ {{ caixa.valorAbertura | number:'1.2-2' }}</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="resumo-vendas">
        <h3>Resumo de Vendas</h3>
        <div class="vendas-grid">
          <div class="venda-item">
            <span class="label">Total de Vendas:</span>
            <span class="value">{{ caixa.quantidadeVendas || 0 }}</span>
          </div>
          <div class="venda-item">
            <span class="label">Valor Total:</span>
            <span class="value primary">R$ {{ caixa.totalVendas || 0 | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="pagamentos">
        <h3>Por Forma de Pagamento</h3>
        <div class="pagamento-item">
          <mat-icon>payments</mat-icon>
          <span>Dinheiro</span>
          <strong>R$ {{ caixa.valorDinheiro || 0 | number:'1.2-2' }}</strong>
        </div>
        <div class="pagamento-item">
          <mat-icon>credit_card</mat-icon>
          <span>Cartão Débito</span>
          <strong>R$ {{ caixa.valorCartaoDebito || 0 | number:'1.2-2' }}</strong>
        </div>
        <div class="pagamento-item">
          <mat-icon>credit_card</mat-icon>
          <span>Cartão Crédito</span>
          <strong>R$ {{ caixa.valorCartaoCredito || 0 | number:'1.2-2' }}</strong>
        </div>
        <div class="pagamento-item">
          <mat-icon>qr_code</mat-icon>
          <span>PIX</span>
          <strong>R$ {{ caixa.valorPix || 0 | number:'1.2-2' }}</strong>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="totais">
        <div class="total-row">
          <span>Fundo de Abertura:</span>
          <span>R$ {{ caixa.valorAbertura | number:'1.2-2' }}</span>
        </div>
        <div class="total-row">
          <span>+ Vendas em Dinheiro:</span>
          <span>R$ {{ caixa.valorDinheiro || 0 | number:'1.2-2' }}</span>
        </div>
        <div class="total-row total-final">
          <span>Total Esperado:</span>
          <strong>R$ {{ calcularTotalEsperado() | number:'1.2-2' }}</strong>
        </div>
      </div>

      <div class="confirmacao">
        <mat-icon>check_circle</mat-icon>
        <p>Confira os valores e confirme o fechamento.</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="confirmar()">
        <mat-icon>lock</mat-icon>
        Confirmar Fechamento
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #f44336;
    }

    mat-dialog-content {
      padding: 24px !important;
      min-width: 500px;
      max-height: 70vh;
    }

    .alert-warning {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      border-radius: 4px;
      margin-bottom: 24px;
    }

    .alert-warning mat-icon {
      color: #ff9800;
    }

    .caixa-info {
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .info-row .label {
      font-weight: 600;
      color: #666;
    }

    .resumo-vendas {
      margin: 20px 0;
    }

    .resumo-vendas h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .vendas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .venda-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .venda-item .value {
      font-size: 24px;
      font-weight: 700;
    }

    .venda-item .value.primary {
      color: #4caf50;
    }

    .pagamentos h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .pagamento-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .pagamento-item mat-icon {
      color: #667eea;
    }

    .pagamento-item span {
      flex: 1;
    }

    .totais {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 8px;
      color: white;
      margin: 20px 0;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .total-row.total-final {
      border-top: 2px solid rgba(255,255,255,0.3);
      padding-top: 12px;
      margin-top: 12px;
      font-size: 20px;
    }

    .confirmacao {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #e8f5e9;
      border-radius: 4px;
    }

    .confirmacao mat-icon {
      color: #4caf50;
    }

    mat-divider {
      margin: 20px 0;
    }
  `]
})
export class FecharCaixaDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FecharCaixaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public caixa: Caixa
  ) {}

  calcularTotalEsperado(): number {
    return this.caixa.valorAbertura + (this.caixa.valorDinheiro || 0);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }
}