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
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/model/cliente.model';

@Component({
  selector: 'app-clientes-list',
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
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'documento', 'contato', 'cidade', 'status', 'acoes'];
  dataSource!: MatTableDataSource<Cliente>;
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clienteService: ClienteService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Cliente>([]);
  }

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (clientes) => {
        this.dataSource.data = clientes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.showMessage('Erro ao carregar clientes', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  excluir(cliente: Cliente): void {
    if (confirm(`Deseja realmente excluir ${cliente.nome}?`)) {
      this.clienteService.delete(cliente.id!).subscribe({
        next: () => {
          this.showMessage('Cliente excluído com sucesso', 'success');
          this.carregarClientes();
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          this.showMessage('Erro ao excluir cliente', 'error');
        }
      });
    }
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