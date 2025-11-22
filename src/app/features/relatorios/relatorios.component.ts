import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    NgChartsModule
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatoriosComponent implements OnInit {
  filtrosForm!: FormGroup;
  loading = false;

  // Dados dos relatórios
  relatorioVendas: any = null;
  produtosMaisVendidos: any[] = [];
  relatorioFaturamento: any = null;

  // Gráfico de Vendas por Dia (Linha)
  @ViewChild('vendasChart') vendasChart?: BaseChartDirective;
  vendasLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  vendasLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Vendas por Dia' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Gráfico de Formas de Pagamento (Pizza)
  @ViewChild('pagamentoChart') pagamentoChart?: BaseChartDirective;
  pagamentoPieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  pagamentoPieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' },
      title: { display: true, text: 'Vendas por Forma de Pagamento' }
    }
  };

  // Gráfico de Faturamento (Barras)
  @ViewChild('faturamentoChart') faturamentoChart?: BaseChartDirective;
  faturamentoBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  faturamentoBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Faturamento por Período' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Gráfico de Categorias (Pizza)
  @ViewChild('categoriasChart') categoriasChart?: BaseChartDirective;
  categoriasPieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  categoriasPieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' },
      title: { display: true, text: 'Faturamento por Categoria' }
    }
  };

  // Tabela de produtos
  produtosDataSource = new MatTableDataSource<any>([]);
  produtosColumns = ['posicao', 'descricao', 'categoria', 'quantidade', 'valorTotal', 'numeroVendas'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.carregarRelatorios();
  }

  createForm(): void {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    this.filtrosForm = this.fb.group({
      dataInicio: [trintaDiasAtras],
      dataFim: [hoje]
    });
  }

  carregarRelatorios(): void {
    this.loading = true;
    const params = this.getFiltrosParams();

    // Carregar todos os relatórios em paralelo
    Promise.all([
      this.carregarRelatorioVendas(params),
      this.carregarProdutosMaisVendidos(params),
      this.carregarRelatorioFaturamento(params)
    ]).then(() => {
      this.loading = false;
    }).catch(error => {
      this.loading = false;
      console.error('Erro ao carregar relatórios:', error);
      this.showMessage('Erro ao carregar relatórios', 'error');
    });
  }

  carregarRelatorioVendas(params: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<any>('relatorios/vendas', params).subscribe({
        next: (data) => {
          this.relatorioVendas = data;
          this.atualizarGraficoVendas(data);
          this.atualizarGraficoPagamento(data);
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar vendas:', error);
          reject(error);
        }
      });
    });
  }

  carregarProdutosMaisVendidos(params: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<any[]>('relatorios/produtos-mais-vendidos', { ...params, top: 10 }).subscribe({
        next: (data) => {
          this.produtosMaisVendidos = data;
          this.produtosDataSource.data = data;
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          reject(error);
        }
      });
    });
  }

  carregarRelatorioFaturamento(params: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<any>('relatorios/faturamento', params).subscribe({
        next: (data) => {
          this.relatorioFaturamento = data;
          this.atualizarGraficoFaturamento(data);
          this.atualizarGraficoCategorias(data);
          resolve();
        },
        error: (error) => {
          console.error('Erro ao carregar faturamento:', error);
          reject(error);
        }
      });
    });
  }

  atualizarGraficoVendas(data: any): void {
    this.vendasLineChartData = {
      labels: data.vendasPorDia.map((v: any) => v.data),
      datasets: [
        {
          data: data.vendasPorDia.map((v: any) => v.total),
          label: 'Valor Total (R$)',
          fill: true,
          tension: 0.4,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)'
        },
        {
          data: data.vendasPorDia.map((v: any) => v.quantidade),
          label: 'Quantidade',
          fill: false,
          tension: 0.4,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          yAxisID: 'y1'
        }
      ]
    };

    this.vendasLineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: 'Evolução de Vendas' }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'Valor (R$)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: { display: true, text: 'Quantidade' },
          grid: { drawOnChartArea: false }
        }
      }
    };

    this.vendasChart?.update();
  }

  atualizarGraficoPagamento(data: any): void {
    const cores = [
      '#4caf50', // Dinheiro
      '#2196f3', // Débito
      '#ff9800', // Crédito
      '#00bcd4', // PIX
      '#9c27b0', // A Prazo
      '#607d8b'  // Outros
    ];

    this.pagamentoPieChartData = {
      labels: data.vendasPorFormaPagamento.map((v: any) => v.formaPagamento),
      datasets: [{
        data: data.vendasPorFormaPagamento.map((v: any) => v.total),
        backgroundColor: cores,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    this.pagamentoChart?.update();
  }

  atualizarGraficoFaturamento(data: any): void {
    this.faturamentoBarChartData = {
      labels: data.faturamentoPorPeriodo.map((f: any) => f.periodo),
      datasets: [{
        data: data.faturamentoPorPeriodo.map((f: any) => f.valor),
        label: 'Faturamento (R$)',
        backgroundColor: 'rgba(102, 126, 234, 0.7)',
        borderColor: '#667eea',
        borderWidth: 2
      }]
    };

    this.faturamentoChart?.update();
  }

  atualizarGraficoCategorias(data: any): void {
    const cores = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];

    this.categoriasPieChartData = {
      labels: data.faturamentoPorCategoria.map((c: any) => c.categoria),
      datasets: [{
        data: data.faturamentoPorCategoria.map((c: any) => c.valor),
        backgroundColor: cores,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    this.categoriasChart?.update();
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

    return params;
  }

  aplicarFiltros(): void {
    this.carregarRelatorios();
  }

  exportarRelatorio(tipo: string): void {
    const params = this.getFiltrosParams();
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Aqui você pode implementar a exportação real
    this.showMessage(`Exportando relatório de ${tipo}...`, 'info');
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