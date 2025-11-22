import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../core/services/api.service';
import { CaixaService } from '../../core/services/caixa.service';
import { Caixa } from '../../core/model/caixa.model';
import { AbrirCaixaDialogComponent } from '../pdv/abrir-caixa-dialog/abrir-caixa-dialog.component';
import { FecharCaixaDialogComponent } from './fechar-caixa-dialog/fechar-caixa-dialog.component';

@Component({
  selector: 'app-caixa',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})
export class CaixaComponent implements OnInit {
  caixaAtual: Caixa | null = null;
  historicoCaixas: Caixa[] = [];
  displayedColumns = ['numeroSessao', 'dataAbertura', 'usuarioAbertura', 'valorAbertura', 'dataFechamento', 'valorFechamento', 'totalVendas', 'status', 'acoes'];
  dataSource = new MatTableDataSource<Caixa>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private caixaService: CaixaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.verificarCaixaAberto();
    this.carregarHistorico();
  }

  verificarCaixaAberto(): void {
    this.caixaService.getCaixaAberto().subscribe({
      next: (caixa) => {
        this.caixaAtual = caixa;
      },
      error: () => {
        this.caixaAtual = null;
      }
    });
  }

  abrirCaixa(): void {
    const dialogRef = this.dialog.open(AbrirCaixaDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(valorAbertura => {
      if (valorAbertura !== undefined && valorAbertura !== null) {
        this.caixaService.abrir(valorAbertura).subscribe({
          next: (caixa) => {
            this.caixaAtual = caixa;
            this.showMessage('Caixa aberto com sucesso!', 'success');
            this.carregarHistorico();
          },
          error: (error) => {
            this.showMessage(error.error?.message || 'Erro ao abrir caixa', 'error');
          }
        });
      }
    });
  }

  fecharCaixa(): void {
    if (!this.caixaAtual) return;
      const dialogRef = this.dialog.open(FecharCaixaDialogComponent, {
      width: '700px',
      disableClose: true,
      data: this.caixaAtual
    });
      dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.caixaService.fechar(this.caixaAtual!.id!).subscribe({
          next: () => {
            this.showMessage('Caixa fechado com sucesso!', 'success');
            this.caixaAtual = null;
            this.carregarHistorico();
          },
          error: (error) => {
            this.showMessage(error.error?.message || 'Erro ao fechar caixa', 'error');
          }
        });
      }
    });
  }
  

  carregarHistorico(): void {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);
    const dataFim = new Date();

    this.caixaService.getHistorico(dataInicio, dataFim).subscribe({
      next: (caixas) => {
        this.historicoCaixas = caixas;
        this.dataSource.data = caixas;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
      }
    });
  }

  verDetalhes(caixa: Caixa): void {
    // Implementar dialog de detalhes se necessário
    this.showMessage('Funcionalidade em desenvolvimento', 'info');
  }

  calcularDiferenca(caixa: Caixa): number {
    if (!caixa.valorFechamento) return 0;
    const esperado = caixa.valorAbertura + (caixa.valorDinheiro || 0);
    return caixa.valorFechamento - esperado;
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