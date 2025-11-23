import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators, 
  AbstractControl, 
  ValidationErrors, 
  ValidatorFn 
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider'; // <--- Adicionado
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../../core/services/usuario.service';

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
    MatDividerModule, // <--- Adicionado
    MatSnackBarModule
  ],
  templateUrl: './usuario-form-component.html',
  styleUrls: ['./usuario-form-component.scss']
})
export class UsuarioFormComponent implements OnInit {
  form!: FormGroup;
  isEdicao = false; // Note: Usamos 'isEdicao' no TS. Se o HTML usar 'isEditMode', corrigiremos no HTML.
  idUsuario: number | null = null;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  perfis = ['Admin', 'Gerente', 'Operador', 'Vendedor'];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  // Getter para facilitar acesso aos controles no HTML (Corrige o erro: Property 'f' does not exist)
  get f() { return this.form.controls; }

  // Alias para isEditMode caso o HTML antigo ainda use (Corrige o erro: Property 'isEditMode' does not exist)
  get isEditMode() { return this.isEdicao; }

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
      cpf: ['', [Validators.required]],
      perfil: ['Operador', Validators.required],
      ativo: [true],
      senha: [''],
      confirmarSenha: ['']
    });

    if (!this.isEdicao) {
      this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('confirmarSenha')?.setValidators([Validators.required]);
      this.form.addValidators(this.senhasIguaisValidator);
    } else {
      this.form.get('senha')?.clearValidators();
      this.form.get('confirmarSenha')?.clearValidators();
    }

    this.form.get('senha')?.updateValueAndValidity();
    this.form.get('confirmarSenha')?.updateValueAndValidity();
  }

  senhasIguaisValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get('senha');
    const confirmarSenha = control.get('confirmarSenha');

    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ ...confirmarSenha.errors, senhasDiferentes: true });
      return { senhasDiferentes: true };
    }
    return null;
  };

  // Método auxiliar para mensagens de erro (Corrige o erro: Property 'getErrorMessage' does not exist)
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) return 'Campo obrigatório';
    if (control?.hasError('email')) return 'E-mail inválido';
    if (control?.hasError('minlength')) return `Mínimo de ${control.errors?.['minlength'].requiredLength} caracteres`;
    if (control?.hasError('senhasDiferentes')) return 'As senhas não conferem';
    return 'Campo inválido';
  }

  carregarUsuario(): void {
    if (!this.idUsuario) return;
    this.loading = true;
    this.usuarioService.getById(this.idUsuario).subscribe({
      next: (usuario) => {
        this.form.patchValue(usuario);
        this.loading = false;
      },
      error: () => {
        this.showMessage('Erro ao carregar usuário', 'error');
        this.router.navigate(['/configuracoes/usuarios']);
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const formValue = this.form.getRawValue();

    const usuarioDto: any = {
      nome: formValue.nome,
      email: formValue.email,
      cpf: formValue.cpf,
      senha: formValue.senha,
      confirmarSenha: formValue.confirmarSenha,
      perfil: formValue.perfil,
      ativo: formValue.ativo
    };

    if (!this.isEdicao) {
      usuarioDto.senha = formValue.senha;
    }

    const request$ = this.isEdicao
      ? this.usuarioService.update(this.idUsuario!, usuarioDto)
      : this.usuarioService.create(usuarioDto);

    request$.subscribe({
      next: () => {
        this.showMessage(`Usuário ${this.isEdicao ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        this.router.navigate(['/configuracoes/usuarios']);
      },
      error: (err) => {
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