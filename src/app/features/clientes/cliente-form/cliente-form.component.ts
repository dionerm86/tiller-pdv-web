import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/model/cliente.model';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatFormFieldModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {
  form!: FormGroup;
  titulo = 'Novo Cliente';
  clienteId?: number;
  loading = false;

  // Lista de UFs brasileiras
  estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  constructor(
    private fb: FormBuilder,
    private service: ClienteService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.clienteId = Number(this.route.snapshot.params['id']);
    
    if (this.clienteId) {
      this.titulo = 'Editar Cliente';
      this.carregarCliente();
    }

    // Watch para alterar validação baseado no tipo de pessoa
    this.form.get('tipoPessoa')?.valueChanges.subscribe(() => {
      this.atualizarValidacoes();
    });
  }

  createForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      tipoPessoa: ['Fisica', Validators.required],
      cpf_CNPJ: [''],
      rg_IE: [''],
      telefone: [''],
      celular: [''],
      email: ['', Validators.email],
      dataNascimento: [null],
      endereco: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
      cep: [''],
      limiteCredito: [0],
      observacoes: [''],
      ativo: [true]
    });
  }

  atualizarValidacoes(): void {
    const tipoPessoa = this.form.get('tipoPessoa')?.value;
    const cpfCnpjControl = this.form.get('cpf_CNPJ');

    if (tipoPessoa === 'Fisica') {
      cpfCnpjControl?.setValidators([Validators.minLength(11), Validators.maxLength(11)]);
    } else {
      cpfCnpjControl?.setValidators([Validators.minLength(14), Validators.maxLength(14)]);
    }
    cpfCnpjControl?.updateValueAndValidity();
  }

  carregarCliente(): void {
    this.loading = true;
    this.service.getById(this.clienteId!).subscribe({
      next: (cliente) => {
        this.form.patchValue(cliente);
        this.loading = false;
      },
      error: (error) => {
        this.snackbar.open('Erro ao carregar cliente', 'Fechar', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/clientes']);
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.snackbar.open('Preencha os campos obrigatórios corretamente', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading = true;
    const cliente: Cliente = this.form.value;

    const req = this.clienteId
      ? this.service.update(this.clienteId, cliente)
      : this.service.create(cliente);

    req.subscribe({
      next: () => {
        this.snackbar.open('Cliente salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
      error: (error) => {
        this.loading = false;
        const mensagem = error.error?.message || 'Erro ao salvar cliente';
        this.snackbar.open(mensagem, 'Fechar', { duration: 5000 });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/clientes']);
  }
}