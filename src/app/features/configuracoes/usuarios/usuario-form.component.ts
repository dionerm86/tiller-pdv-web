import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss']
})
export class UsuarioFormComponent implements OnInit {
  form!: FormGroup;
  isEdicao = false;
  idUsuario: number | null = null;
  loading = false;
  hidePassword = true;

  perfis = ['Admin', 'Gerente', 'Operador', 'Vendedor'];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.idUsuario = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdicao = !!this.idUsuario;

    this.inicializarFormulario();

    if (this.isEdicao) {
      this.carregarUsuario();
    }
  }

  inicializarFormulario(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required]], // Ideal adicionar validador de CPF customizado depois
      perfil: ['Operador', Validators.required],
      ativo: [true],
      // Senha é obrigatória apenas na criação
      senha: [
        '', 
        this.isEdicao ? [] : [Validators.required, Validators.minLength(6)]
      ]
    });
  }

  carregarUsuario(): void {
    if (!this.idUsuario) return;

    this.loading = true;
    this.usuarioService.getById(this.idUsuario).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          perfil: usuario.perfil,
          ativo: usuario.ativo
        });
        // Na edição, removemos o controle de senha da validação ou desabilitamos se não for usado
        this.form.get('senha')?.disable(); 
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Erro ao carregar usuário', 'error');
        this.router.navigate(['/configuracoes/usuarios']);
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const usuario = this.form.getRawValue();

    // Remove formatação básica de CPF se necessário (seu backend remove mascára, mas é bom garantir)
    // usuario.cpf = usuario.cpf.replace(/\D/g, '');

    const request$ = this.isEdicao
      ? this.usuarioService.update(this.idUsuario!, usuario)
      : this.usuarioService.create(usuario);

    request$.subscribe({
      next: () => {
        this.showMessage(
          `Usuário ${this.isEdicao ? 'atualizado' : 'criado'} com sucesso!`, 
          'success'
        );
        this.router.navigate(['/configuracoes/usuarios']);
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Erro ao salvar usuário';
        this.showMessage(msg, 'error');
        this.loading = false;
      }
    });
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.snackBar.open(msg, 'Fechar', {
      duration: 3000,
      panelClass: type === 'error' ? 'snackbar-error' : 'snackbar-success',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}