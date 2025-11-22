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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsuarioService, Usuario } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-usuarios-list',
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
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'email', 'cpf', 'perfil', 'ultimoAcesso', 'status', 'acoes'];
  dataSource!: MatTableDataSource<Usuario>;
  loading = true;
  currentUserId: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Usuario>([]);
    
    // Pegar ID do usuário atual
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.currentUserId = currentUser.id;
    }
  }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (usuarios) => {
        this.dataSource.data = usuarios;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.showMessage('Erro ao carregar usuários', 'error');
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

  excluir(usuario: Usuario): void {
    if (usuario.id === this.currentUserId) {
      this.showMessage('Você não pode excluir seu próprio usuário', 'error');
      return;
    }

    if (confirm(`Deseja realmente inativar ${usuario.nome}?`)) {
      this.usuarioService.delete(usuario.id!).subscribe({
        next: () => {
          this.showMessage('Usuário inativado com sucesso', 'success');
          this.carregarUsuarios();
        },
        error: (error) => {
          console.error('Erro ao inativar usuário:', error);
          this.showMessage('Erro ao inativar usuário', 'error');
        }
      });
    }
  }

  reativar(usuario: Usuario): void {
    if (confirm(`Deseja reativar ${usuario.nome}?`)) {
      this.usuarioService.reativar(usuario.id!).subscribe({
        next: () => {
          this.showMessage('Usuário reativado com sucesso', 'success');
          this.carregarUsuarios();
        },
        error: (error) => {
          console.error('Erro ao reativar usuário:', error);
          this.showMessage('Erro ao reativar usuário', 'error');
        }
      });
    }
  }

  formatarPerfil(perfil: string): string {
    const perfis: any = {
      'Admin': 'Administrador',
      'Gerente': 'Gerente',
      'Operador': 'Operador',
      'Vendedor': 'Vendedor'
    };
    return perfis[perfil] || perfil;
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