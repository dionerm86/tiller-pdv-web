import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Venda } from '../../../core/model/venda.model';

@Component({
  selector: 'app-venda-detalhes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './venda-detalhes-dialog.component.html',
  styleUrls: ['./venda-detalhes-dialog.component.scss']
})
export class VendaDetalhesDialogComponent {
  displayedColumns: string[] = ['descricao', 'quantidade', 'precoUnitario', 'desconto', 'subtotal'];

  constructor(
    public dialogRef: MatDialogRef<VendaDetalhesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public venda: Venda
  ) {}

  formatarFormaPagamento(forma: string): string {
    const formas: any = {
      'Dinheiro': 'Dinheiro',
      'CartaoDebito': 'Cartão Débito',
      'CartaoCredito': 'Cartão Crédito',
      'Pix': 'PIX',
      'APrazo': 'A Prazo',
      'Multiplo': 'Múltiplo'
    };
    return formas[forma] || forma;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  imprimir(): void {
    window.print();
  }
}