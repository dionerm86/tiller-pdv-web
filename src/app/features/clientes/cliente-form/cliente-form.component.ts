import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/model/cliente.model';
import { MatIconModule } from '@angular/material/icon';

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
    MatSnackBarModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {

  form!: FormGroup;
  titulo = 'Novo Cliente';
  clienteId?: number;

  constructor(
    private fb: FormBuilder,
    private service: ClienteService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.params['id']);
    
    this.form = this.fb.group({
      nome: ['', Validators.required],
      tipoPessoa: ['Fisica', Validators.required],
      cpf_Cnpj: [''],
      telefone: [''],
      celular: [''],
      email: ['', Validators.email],
      cidade: [''],
      estado: [''],
      endereco: [''],
      numero: [''],
      limiteCredito: [null],
      observacoes: ['']
    });

    if (this.clienteId) {
      this.titulo = 'Editar Cliente';
      this.service.getById(this.clienteId).subscribe(c => this.form.patchValue(c));
    }
  }

  salvar() {
    if (this.form.invalid) return;

    const cliente: Cliente = this.form.value;

    const req = this.clienteId
      ? this.service.update(this.clienteId, cliente)
      : this.service.create(cliente);

    req.subscribe({
      next: () => {
        this.snackbar.open('Cliente salvo com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.snackbar.open('Erro ao salvar cliente', 'Fechar', { duration: 3000 });
      }
    });
  }
}