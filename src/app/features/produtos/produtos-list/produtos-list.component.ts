import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProdutoService } from '../../../core/services/produto.service';
import { Produto } from '../../../core/model/produto.model';

@Component({
  selector: 'app-produtos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="produtos-container">
      <div class="header">
        <div>
          <h1>Produtos</h1>
          <p class="subtitle">Gerenciar produtos cadastrados</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/produtos/novo">
          <mat-icon>add</mat-icon>
          Novo Produto
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="table-controls">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar produto</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Nome, código de barras...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <div class="filter-chips">
              <mat-chip-set>
                <mat-chip (click)="filtrarPorEstoque('todos')" [highlighted]="filtroEstoque === 'todos'">
                  Todos
                </mat-chip>
                <mat-chip (click)="filtrarPorEstoque('baixo')" [highlighted]="filtroEstoque === 'baixo'">
                  Estoque Baixo
                </mat-chip>
                <mat-chip (click)="filtrarPorEstoque('zerado')" [highlighted]="filtroEstoque === 'zerado'">
                  Zerado
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Código -->
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Código</th>
                <td mat-cell *matCellDef="let produto">
                  {{ produto.codigoBarras || produto.codigoInterno || '-' }}
                </td>
              </ng-container>

              <!-- Descrição -->
              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Descrição</th>
                <td mat-cell *matCellDef="let produto">
                  <div class="produto-info">
                    <strong>{{ produto.descricao }}</strong>
                    <small>{{ produto.categoria?.nome }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Preço -->
              <ng-container matColumnDef="preco">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Preço</th>
                <td mat-cell *matCellDef="let produto">
                  R$ {{ produto.precoVenda | number:'1.2-2' }}
                </td>
              </ng-container>

              <!-- Estoque -->
              <ng-container matColumnDef="estoque">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Estoque</th>
                <td mat-cell *matCellDef="let produto">
                  <mat-chip [class.chip-danger]="produto.estoqueAtual <= produto.estoqueMinimo"
                            [class.chip-warning]="produto.estoqueAtual > produto.estoqueMinimo && produto.estoqueAtual < (produto.estoqueMinimo * 2)">
                    {{ produto.estoqueAtual }} {{ produto.unidadeMedida }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let produto">
                  <mat-chip [class.chip-success]="produto.ativo" [class.chip-inactive]="!produto.ativo">
                    {{ produto.ativo ? 'Ativo' : 'Inativo' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let produto">
                  <button mat-icon-button [routerLink]="['/produtos', produto.id]" matTooltip="Editar">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="excluir(produto)" matTooltip="Excluir" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                  <div class="no-data">
                    <mat-icon>inventory_2</mat-icon>
                    <p>Nenhum produto encontrado</p>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" 
                         showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .produtos-container {
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

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .produto-info strong {
      display: block;
      margin-bottom: 4px;
    }

    .produto-info small {
      color: #666;
      font-size: 12px;
    }

    .chip-danger {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .chip-warning {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    .chip-success {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .chip-inactive {
      background-color: #f5f5f5 !important;
      color: #757575 !important;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
  `]
})
export class ProdutosListComponent implements OnInit {
  displayedColumns: string[] = ['codigo', 'descricao', 'preco', 'estoque', 'status', 'acoes'];
  dataSource!: MatTableDataSource<Produto>;
  filtroEstoque = 'todos';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private produtoService: ProdutoService) {
    this.dataSource = new MatTableDataSource<Produto>([]);
  }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.getAtivos().subscribe({
      next: (produtos) => {
        this.dataSource.data = produtos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filtrarPorEstoque(tipo: string): void {
    this.filtroEstoque = tipo;
    // Implementar filtro
  }

  excluir(produto: Produto): void {
    if (confirm(`Deseja realmente excluir ${produto.descricao}?`)) {
      this.produtoService.delete(produto.id!).subscribe({
        next: () => {
          this.carregarProdutos();
        }
      });
    }
  }
}