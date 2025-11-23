import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';

import { LogService, LogAuditoria } from '../../../../core/services/log.service';
import { UsuarioService, Usuario } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule
  ],
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss']
})
export class LogsListComponent implements OnInit {
  displayedColumns: string[] = ['dataHora', 'usuario', 'acao', 'tabela', 'ip', 'detalhes'];
  dataSource = new MatTableDataSource<LogAuditoria>([]);
  loading = false;
  
  filterForm!: FormGroup;
  usuarios: Usuario[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private logService: LogService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.carregarUsuarios();
    this.buscarLogs(); // Busca inicial
  }

  initForm(): void {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    this.filterForm = this.fb.group({
      dataInicio: [inicioMes],
      dataFim: [hoje],
      usuarioId: [null],
      acao: ['']
    });
  }

  carregarUsuarios(): void {
    this.usuarioService.getAll().subscribe({
      next: (users) => this.usuarios = users,
      error: () => console.error('Erro ao carregar usuários para filtro')
    });
  }

  buscarLogs(): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.logService.getLogs(filters).subscribe({
      next: (logs) => {
        this.dataSource.data = logs;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Erro ao carregar logs', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  limparFiltros(): void {
    this.initForm();
    this.buscarLogs();
  }
}