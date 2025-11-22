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
import { ApiService } from '../../../core/services/api.service';
import { Venda } from '../../../core/model/venda.model';
import { VendaDetalhesDialogComponent } from '../venda-detalhes-dialog/venda-detalhes-dialog.component';
import { CancelarVendaDialogComponent } from '../cancelar-venda-dialog/cancelar-venda-dialog.component';

@Component({
  selector: 'app-vendas',
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
    MatSnackBarModule
],
  templateUrl: './vendas-list.component.html',
  styleUrls: ['./vendas-list.component.scss']
})
export class VendasComponent implements OnInit {
  displayedColumns: string[] = ['numeroVenda', 'dataHora', 'cliente', 'vendedor', 'formaPagamento', 'valorTotal', 'status', 'acoes'];
  dataSource!: MatTableDataSource<Venda>;
  filtrosForm!: FormGroup;
  resumoVendas: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Venda>([]);
    this.createForm();
  }

  ngOnInit(): void {
    this.carregarVendas();
  }

  createForm(): void {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    this.filtrosForm = this.fb.group({
      dataInicio: [trintaDiasAtras],
      dataFim: [hoje],
      status: [''],
      formaPagamento: [''],
      busca: ['']
    });
  }

  carregarVendas(): void {
    const filtros = this.getFiltrosParams();

    this.apiService.get<Venda[]>('vendas/filtrar', filtros).subscribe({
      next: (vendas) => {
        this.dataSource.data = vendas;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.calcularResumo(vendas);
      },
      error: (error) => {
        console.error('Erro ao carregar vendas:', error);
        this.showMessage('Erro ao carregar vendas', 'error');
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
    if (valores.status) {
      params.status = valores.status;
    }
    if (valores.formaPagamento) {
      params.formaPagamento = valores.formaPagamento;
    }
    if (valores.busca) {
      params.busca = valores.busca;
    }

    return params;
  }

  aplicarFiltros(): void {
    this.carregarVendas();
  }

  limparFiltros(): void {
    this.createForm();
    this.carregarVendas();
  }

  calcularResumo(vendas: Venda[]): void {
    const vendasConcluidas = vendas.filter(v => v.status === 'Concluida');
    const valorTotal = vendasConcluidas.reduce((sum, v) => sum + v.valorTotal, 0);
    const quantidade = vendasConcluidas.length;

    this.resumoVendas = {
      quantidade,
      valorTotal,
      ticketMedio: quantidade > 0 ? valorTotal / quantidade : 0
    };
  }

  formatarFormaPagamento(forma: string): string {
    const formas: any = {
      'Dinheiro': 'Dinheiro',
      'CartaoDebito': 'C. Débito',
      'CartaoCredito': 'C. Crédito',
      'Pix': 'PIX',
      'APrazo': 'A Prazo',
      'Multiplo': 'Múltiplo'
    };
    return formas[forma] || forma;
  }

  verDetalhes(venda: Venda): void {
    // Carregar venda completa com itens
    this.apiService.get<Venda>(`vendas/${venda.id}`).subscribe({
      next: (vendaCompleta) => {
        this.dialog.open(VendaDetalhesDialogComponent, {
          width: '900px',
          maxHeight: '90vh',
          data: vendaCompleta
        });
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes:', error);
        this.showMessage('Erro ao carregar detalhes da venda', 'error');
      }
    });
  }

  imprimirComprovante(venda: Venda): void {
    this.apiService.get(`vendas/${venda.id}/comprovante`, {}, 'blob').subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        } else {
          // Fallback: fazer download
          const a = document.createElement('a');
          a.href = url;
          a.download = `comprovante-${venda.numeroVenda}.html`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        
        this.showMessage('Comprovante gerado com sucesso!', 'success');
      },
      error: (error) => {
        console.error('Erro ao gerar comprovante:', error);
        this.showMessage('Erro ao gerar comprovante', 'error');
      }
    });
  }

  cancelarVenda(venda: Venda): void {
    const dialogRef = this.dialog.open(CancelarVendaDialogComponent, {
      width: '500px',
      data: venda
    });

    dialogRef.afterClosed().subscribe(motivo => {
      if (motivo) {
        this.apiService.post(`vendas/${venda.id}/cancelar`, { motivo }).subscribe({
          next: () => {
            this.showMessage('Venda cancelada com sucesso!', 'success');
            this.carregarVendas();
          },
          error: (error) => {
            const mensagem = error.error?.message || 'Erro ao cancelar venda';
            this.showMessage(mensagem, 'error');
          }
        });
      }
    });
  }

  exportar(): void {
    const filtros = this.getFiltrosParams();
    
    // Construir query string
    const queryString = Object.keys(filtros)
      .map(key => `${key}=${encodeURIComponent(filtros[key])}`)
      .join('&');
    
    const url = `${this.apiService['baseUrl']}/vendas/exportar?${queryString}`;
    
    // Abrir em nova aba para download
    window.open(url, '_blank');
    
    this.showMessage('Exportação iniciada!', 'success');
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