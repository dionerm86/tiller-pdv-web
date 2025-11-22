import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Produto } from '../../../core/model/produto.model';

@Component({
  selector: 'app-movimentar-estoque-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './movimentar-estoque-dialog.component.html',
  styleUrls: ['./movimentar-estoque-dialog.component.scss']
})
export class MovimentarEstoqueDialogComponent implements OnInit {
  form: FormGroup;
  produtos: Produto[] = [];
  produtoSelecionado: Produto | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MovimentarEstoqueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tipo: 'entrada' | 'saida' | 'ajuste' }
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  createForm(): FormGroup {
    const form = this.fb.group({
      produtoId: ['', Validators.required],
      quantidade: ['', [Validators.required, Validators.min(0.01)]],
      motivo: ['', [Validators.required, Validators.minLength(5)]]
    });

    form.get('produtoId')?.valueChanges.subscribe(produtoId => {
        const id = Number(produtoId);
        this.produtoSelecionado = this.produtos.find(p => p.id === id) || null;
    });

    return form;
  }

  carregarProdutos(): void {
    this.apiService.get<Produto[]>('produtos/ativos').subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.showMessage('Erro ao carregar produtos', 'error');
      }
    });
  }

  getTitulo(): string {
    const titulos = {
      'entrada': 'Entrada de Estoque',
      'saida': 'Saída de Estoque',
      'ajuste': 'Ajustar Estoque'
    };
    return titulos[this.data.tipo];
  }

  getIcone(): string {
    const icones = {
      'entrada': 'add_circle',
      'saida': 'remove_circle',
      'ajuste': 'tune'
    };
    return icones[this.data.tipo];
  }

  getColor(): string {
    const cores = {
      'entrada': 'primary',
      'saida': 'warn',
      'ajuste': 'accent'
    };
    return cores[this.data.tipo];
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (this.form.valid) {
      this.loading = true;
      const dados = this.form.value;

      let endpoint = '';
      if (this.data.tipo === 'entrada') {
        endpoint = 'estoque/adicionar';
      } else if (this.data.tipo === 'saida') {
        endpoint = 'estoque/remover';
      } else {
        endpoint = 'estoque/ajustar';
        dados.quantidadeNova = dados.quantidade;
        delete dados.quantidade;
      }

      this.apiService.post(endpoint, dados).subscribe({
        next: (response: any) => {
          this.showMessage(response.message || 'Operação realizada com sucesso!', 'success');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading = false;
          const mensagem = error.error?.message || 'Erro ao realizar operação';
          this.showMessage(mensagem, 'error');
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