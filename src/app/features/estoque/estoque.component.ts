import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../core/services/api.service';
import { MovimentacaoEstoque, ResumoEstoque } from '../../core/model/movimentacao-estoque.model';
import { Produto } from '../../core/model/produto.model';
import { MovimentarEstoqueDialogComponent } from './movimentar-estoque-dialog/movimentar-estoque-dialog.component';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.scss']
})
export class EstoqueComponent implements OnInit {
  displayedColumns: string[] = ['dataHora', 'produto', 'tipoMovimento', 'quantidade', 'quantidadeAnterior', 'quantidadeAtual', 'usuario', 'motivo'];
  dataSource!: MatTableDataSource<MovimentacaoEstoque>;
  filtrosForm!: FormGroup;
  resumo: ResumoEstoque | null = null;
  produtosEstoqueBaixo: Produto[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<MovimentacaoEstoque>([]);
    this.createForm();
  }

  ngOnInit(): void {
    this.carregarMovimentacoes();
    this.carregarProdutosEstoqueBaixo();
    this.carregarResumo();
  }

  createForm(): void {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    this.filtrosForm = this.fb.group({
      dataInicio: [trintaDiasAtras],
      dataFim: [hoje],
      tipoMovimento: [''],
      produtoId: [null]
    });
  }

  carregarMovimentacoes(): void {
    const filtros = this.getFiltrosParams();

    this.apiService.get<MovimentacaoEstoque[]>('estoque/movimentacoes', filtros).subscribe({
      next: (movimentacoes) => {
        this.dataSource.data = movimentacoes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        console.error('Erro ao carregar movimentações:', error);
        this.showMessage('Erro ao carregar movimentações', 'error');
      }
    });
  }

  carregarProdutosEstoqueBaixo(): void {
    this.apiService.get<Produto[]>('estoque/estoque-baixo').subscribe({
      next: (produtos) => {
        this.produtosEstoqueBaixo = produtos;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
      }
    });
  }

  carregarResumo(): void {
    const filtros = this.getFiltrosParams();
    
    this.apiService.get<ResumoEstoque>('estoque/resumo', filtros).subscribe({
      next: (resumo) => {
        this.resumo = resumo;
      },
      error: (error) => {
        console.error('Erro ao carregar resumo:', error);
      }
    });
  }

  getFiltrosParams(): any {
    const valores = this.filtrosForm.value;
    const params: any = {};

    if (valores.dataInicio) {
      params.dataInicio = valores.dataInicio.toISOString();
    }
    if (valores.dataFim) {
      const dataFim = new Date(valores.dataFim);
      dataFim.setHours(23, 59, 59);
      params.dataFim = dataFim.toISOString();
    }
    if (valores.tipoMovimento) {
      params.tipoMovimento = valores.tipoMovimento;
    }
    if (valores.produtoId) {
      params.produtoId = valores.produtoId;
    }

    return params;
  }

  aplicarFiltros(): void {
    this.carregarMovimentacoes();
    this.carregarResumo();
  }

  limparFiltros(): void {
    this.createForm();
    this.carregarMovimentacoes();
    this.carregarResumo();
  }

  abrirDialogMovimentacao(tipo: 'entrada' | 'saida' | 'ajuste'): void {
    const dialogRef = this.dialog.open(MovimentarEstoqueDialogComponent, {
      width: '600px',
      data: { tipo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarMovimentacoes();
        this.carregarProdutosEstoqueBaixo();
        this.carregarResumo();
      }
    });
  }

  formatarTipoMovimento(tipo: string): string {
    const tipos: any = {
      'Entrada': 'Entrada',
      'Saida': 'Saída',
      'Ajuste': 'Ajuste',
      'Devolucao': 'Devolução',
      'Perda': 'Perda'
    };
    return tipos[tipo] || tipo;
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
