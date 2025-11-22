import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { CepService } from '../../../core/services/cep.service';
import { ValidatorsService } from '../../../core/services/validador.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
export class ClienteComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  clienteId?: number;
  isLoadingCep = false;
  titulo = 'Novo Cliente';
  podeComprar: boolean = true;

  estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private cepService: CepService,
    private validatorsService: ValidatorsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
  this.form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    tipoPessoa: ['Fisica', Validators.required],
    cpf_CNPJ: ['', [Validators.required, this.validatorsService.cpfCnpjValidator()]],
    rg_IE: [''],
    dataNascimento: [''],
    email: ['', [Validators.email]],
    telefone: ['', [Validators.required]],
    celular: [''],
    cep: ['', [Validators.required]],
    endereco: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    complemento: [''],
    bairro: ['', [Validators.required]],
    cidade: ['', [Validators.required]],
    estado: ['', [Validators.required]],
    limiteCredito: [0],
    observacoes: [''],
    ativo: [true],
    podeComprar: [true] // ADICIONAR ESTE CAMPO
  });

  // Listener para buscar CEP automaticamente
  this.form.get('cep')?.valueChanges.subscribe(cep => {
    if (cep && this.cepService.validarCep(cep)) {
      this.buscarCep(cep);
    }
  });
}

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clienteId = +id;
      this.titulo = 'Editar Cliente';
      this.loadcliente(this.clienteId);
    }
  }

  private loadcliente(id: number): void {
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        if (cliente) {
          // mapeia os nomes do backend para os nomes do form se necessário
          const patch = {
            nome: cliente.nome,
            tipoPessoa: cliente.tipoPessoa ?? 'Fisica',
            cpf_CNPJ: cliente.cpf_CNPJ ?? cliente.cpf_CNPJ,
            rg_IE: cliente.rg_IE,
            dataNascimento: cliente.dataNascimento,
            email: cliente.email,
            telefone: cliente.telefone,
            celular: cliente.celular,
            cep: cliente.cep,
            endereco: cliente.endereco,
            numero: cliente.numero,
            complemento: cliente.complemento,
            bairro: cliente.bairro,
            cidade: cliente.cidade,
            estado: cliente.estado,
            limiteCredito: cliente.limiteCredito,
            observacoes: cliente.observacoes,
            ativo: cliente.ativo ?? true
          };
          this.form.patchValue(patch);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        alert('Erro ao carregar dados do cliente!');
      }
    });
  }

  buscarCep(cep: string): void {
    this.isLoadingCep = true;

    this.cepService.buscarCep(cep).subscribe({
      next: (endereco) => {
        this.isLoadingCep = false;

        if (endereco) {
          this.form.patchValue({
            endereco: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado
          });

          // Foca no campo número após preencher o endereço
          setTimeout(() => {
            const numeroInput = document.querySelector('[formControlName="numero"]') as HTMLInputElement;
            if (numeroInput) {
              numeroInput.focus();
            }
          }, 100);
        } else {
          alert('CEP não encontrado!');
        }
      },
      error: (error) => {
        this.isLoadingCep = false;
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Verifique sua conexão!');
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Por favor, preencha todos os campos obrigatórios corretamente!');
      return;
    }

    const cliente = this.form.value;

    // Se estiver editando, use o id da rota (this.clienteId). Evita depender de cliente.Id no form value.
    if (this.isEditMode && this.clienteId) {
      this.clienteService.update(this.clienteId, cliente).subscribe({
        next: () => {
          alert('Cliente atualizado com sucesso!');
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          console.error('Erro ao atualizar cliente:', error);
          alert('Erro ao salvar cliente!');
        }
      });
    } else {
      this.clienteService.create(cliente).subscribe({
        next: () => {
          alert('Cliente cadastrado com sucesso!');
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          console.error('Erro ao criar cliente:', error);
          alert('Erro ao salvar cliente!');
        }
      });
    }
  }

  cancelar(): void {
    if (confirm('Deseja realmente cancelar? As alterações não salvas serão perdidas.')) {
      this.router.navigate(['/clientes']);
    }
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Este campo é obrigatório';
    }

    if (field.hasError('email')) {
      return 'E-mail inválido';
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors!['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }

    // adaptações possíveis para os erros customizados do validador
    if (field.hasError('cpfInvalido')) {
      return 'CPF inválido';
    }

    if (field.hasError('cnpjInvalido')) {
      return 'CNPJ inválido';
    }

    return 'Campo inválido';
  }
}
