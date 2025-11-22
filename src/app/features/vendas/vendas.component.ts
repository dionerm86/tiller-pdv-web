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
import { ApiService } from '../../core/services/api.service';
import { Venda } from '../../core/model/venda.model';
import { VendaDetalhesDialogComponent } from './venda-detalhes-dialog/venda-detalhes-dialog.component';

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
    MatNativeDateModule
  ],
  template: `
    <div class="vendas-container">
      <div class="header">
        <div>
          <h1>Histórico de Vendas</h1>
          <p class="subtitle">Consultar e gerenciar vendas realizadas</p>
        </div>
        <button mat-raised-button color="primary" (click)="exportar()">
          <mat-icon>download</mat-icon>
          Exportar
        </button>
      </div>

      <!-- Filtros -->
      <mat-card class="filtros-card">
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filtros-form">
            <mat-form-field appearance="outline">
              <mat-label>Data Início</mat-label>
              <input matInput [matDatepicker]="pickerInicio" formControlName="dataInicio">
              <mat-datepicker-toggle matIconSuffix [for]="pickerInicio"></mat-datepicker-toggle>
              <mat-datepicker #pickerInicio></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data Fim</mat-label>
              <input matInput [matDatepicker]="pickerFim" formControlName="dataFim">
              <mat-datepicker-toggle matIconSuffix [for]="pickerFim"></mat-datepicker-toggle>
              <mat-datepicker #pickerFim></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Concluida">Concluída</mat-option>
                <mat-option value="Cancelada">Cancelada</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Forma de Pagamento</mat-label>
              <mat-select formControlName="formaPagamento">
                <mat-option value="">Todas</mat-option>
                <mat-option value="Dinheiro">Dinheiro</mat-option>
                <mat-option value="CartaoDebito">Cartão Débito</mat-option>
                <mat-option value="CartaoCredito">Cartão Crédito</mat-option>
                <mat-option value="Pix">PIX</mat-option>
                <mat-option value="APrazo">A Prazo</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="busca-field">
              <mat-label>Buscar</mat-label>
              <input matInput formControlName="busca" placeholder="Nº venda, cliente...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="aplicarFiltros()">
              <mat-icon>filter_list</mat-icon>
              Filtrar
            </button>

            <button mat-stroked-button (click)="limparFiltros()">
              <mat-icon>clear</mat-icon>
              Limpar
            </button>
          </form>

          <!-- Resumo das Vendas Filtradas -->
          <div class="resumo-vendas" *ngIf="resumoVendas">
            <div class="resumo-item">
              <span class="label">Total de Vendas:</span>
              <span class="value">{{ resumoVendas.quantidade }}</span>
            </div>
            <div class="resumo-item">
              <span class="label">Valor Total:</span>
              <span class="value primary">R$ {{ resumoVendas.valorTotal | number:'1.2-2' }}</span>
            </div>
            <div class="resumo-item">
              <span class="label">Ticket Médio:</span>
              <span class="value">R$ {{ resumoVendas.ticketMedio | number:'1.2-2' }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Tabela de Vendas -->
      <mat-card>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Número Venda -->
              <ng-container matColumnDef="numeroVenda">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nº Venda</th>
                <td mat-cell *matCellDef="let venda">
                  <strong>{{ venda.numeroVenda }}</strong>
                </td>
              </ng-container>

              <!-- Data/Hora -->
              <ng-container matColumnDef="dataHora">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Data/Hora</th>
                <td mat-cell *matCellDef="let venda">
                  {{ venda.dataHora | date:'dd/MM/yyyy HH:mm' }}
                </td>
              </ng-container>

              <!-- Cliente -->
              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let venda">
                  {{ venda.cliente?.nome || 'Consumidor Final' }}
                </td>
              </ng-container>

              <!-- Vendedor -->
              <ng-container matColumnDef="vendedor">
                <th mat-header-cell *matHeaderCellDef>Vendedor</th>
                <td mat-cell *matCellDef="let venda">
                  {{ venda.usuario?.nome }}
                </td>
              </ng-container>

              <!-- Forma Pagamento -->
              <ng-container matColumnDef="formaPagamento">
                <th mat-header-cell *matHeaderCellDef>Pagamento</th>
                <td mat-cell *matCellDef="let venda">
                  <mat-chip [class]="'chip-' + venda.formaPagamento">
                    {{ formatarFormaPagamento(venda.formaPagamento) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Valor Total -->
              <ng-container matColumnDef="valorTotal">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Valor Total</th>
                <td mat-cell *matCellDef="let venda">
                  <strong class="valor-destaque">R$ {{ venda.valorTotal | number:'1.2-2' }}</strong>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let venda">
                  <mat-chip [class.chip-success]="venda.status === 'Concluida'"
                            [class.chip-danger]="venda.status === 'Cancelada'">
                    {{ venda.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let venda">
                  <button mat-icon-button (click)="verDetalhes(venda)" matTooltip="Ver Detalhes">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="imprimirComprovante(venda)" matTooltip="Imprimir">
                    <mat-icon>print</mat-icon>
                  </button>
                  <button mat-icon-button 
                          (click)="cancelarVenda(venda)" 
                          matTooltip="Cancelar Venda"
                          [disabled]="venda.status === 'Cancelada'"
                          color="warn">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  class="table-row"
                  (click)="verDetalhes(row)"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                  <div class="no-data">
                    <mat-icon>receipt_long</mat-icon>
                    <p>Nenhuma venda encontrada</p>
                    <small>Ajuste os filtros ou realize novas vendas</small>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator 
            [pageSizeOptions]="[10, 25, 50, 100]"
            [pageSize]="25"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .vendas-container {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: #666;
    }

    .filtros-card {
      margin-bottom: 24px;
    }

    .filtros-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: center;
    }

    .busca-field {
      grid-column: span 2;
    }

    .resumo-vendas {
      display: flex;
      gap: 32px;
      margin-top: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .resumo-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .resumo-item .label {
      font-size: 14px;
      opacity: 0.9;
    }

    .resumo-item .value {
      font-size: 28px;
      font-weight: 700;
    }

    .resumo-item .value.primary {
      font-size: 32px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .table-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .table-row:hover {
      background-color: #f5f5f5;
    }

    .valor-destaque {
      color: #667eea;
      font-size: 16px;
    }

    mat-chip {
      font-size: 12px;
    }

    .chip-Dinheiro {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .chip-CartaoDebito,
    .chip-CartaoCredito {
      background-color: #2196f3 !important;
      color: white !important;
    }

    .chip-Pix {
      background-color: #00bcd4 !important;
      color: white !important;
    }

    .chip-APrazo {
      background-color: #ff9800 !important;
      color: white !important;
    }

    .chip-success {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .chip-danger {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .filtros-form {
        grid-template-columns: 1fr;
      }

      .busca-field {
        grid-column: span 1;
      }

      .resumo-vendas {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
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
    private dialog: MatDialog
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

    this.apiService.get<Venda[]>('dashboard/vendas-periodo', filtros).subscribe({
      next: (vendas) => {
        this.dataSource.data = vendas;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.calcularResumo(vendas);
      },
      error: (error) => {
        console.error('Erro ao carregar vendas:', error);
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
    this.dialog.open(VendaDetalhesDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: venda
    });
  }

  imprimirComprovante(venda: Venda): void {
    // Implementar impressão
    console.log('Imprimir venda:', venda);
  }

  cancelarVenda(venda: Venda): void {
    // Implementar cancelamento
    console.log('Cancelar venda:', venda);
  }

  exportar(): void {
    // Implementar exportação
    console.log('Exportar vendas');
  }
}