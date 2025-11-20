import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProdutoService } from '../../../core/services/produto.service';
import { ApiService } from '../../../core/services/api.service';
import { Produto, Categoria } from '../../../core/model/produto.model';

@Component({
  selector: 'app-produto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <div class="form-container">
      <div class="header">
        <button mat-icon-button routerLink="/produtos">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ isEdit ? 'Editar' : 'Novo' }} Produto</h1>
          <p class="subtitle">Preencha os dados do produto</p>
        </div>
      </div>

      <form [formGroup]="produtoForm" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Informações Básicas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="col-2">
                <mat-label>Descrição</mat-label>
                <input matInput formControlName="descricao" placeholder="Nome do produto">
                <mat-icon matPrefix>inventory_2</mat-icon>
                <mat-error *ngIf="produtoForm.get('descricao')?.hasError('required')">
                  Descrição é obrigatória
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Código de Barras</mat-label>
                <input matInput formControlName="codigoBarras" placeholder="EAN-13">
                <mat-icon matPrefix>qr_code_2</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Código Interno</mat-label>
                <input matInput formControlName="codigoInterno">
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-2">
                <mat-label>Categoria</mat-label>
                <mat-select formControlName="categoriaId">
                  <mat-option *ngFor="let cat of categorias" [value]="cat.id">
                    {{ cat.nome }}
                  </mat-option>
                </mat-select>
                <mat-error>Categoria é obrigatória</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Unidade de Medida</mat-label>
                <mat-select formControlName="unidadeMedida">
                  <mat-option value="UN">Unidade</mat-option>
                  <mat-option value="KG">Quilograma</mat-option>
                  <mat-option value="LT">Litro</mat-option>
                  <mat-option value="MT">Metro</mat-option>
                  <mat-option value="CX">Caixa</mat-option>
                  <mat-option value="PC">Peça</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="col-3">
                <mat-label>Descrição Detalhada</mat-label>
                <textarea matInput formControlName="descricaoDetalhada" rows="3"></textarea>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Preços e Margem</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Preço de Compra</mat-label>
                <input matInput type="number" formControlName="precoCompra" step="0.01" min="0">
                <span matPrefix>R$&nbsp;</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Preço de Venda</mat-label>
                <input matInput type="number" formControlName="precoVenda" step="0.01" min="0">
                <span matPrefix>R$&nbsp;</span>
                <mat-error>Preço é obrigatório</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Margem de Lucro</mat-label>
                <input matInput type="number" formControlName="margemLucro" readonly>
                <span matSuffix>&nbsp;%</span>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Estoque</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Estoque Atual</mat-label>
                <input matInput type="number" formControlName="estoqueAtual" min="0">
                <mat-icon matPrefix>inventory</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estoque Mínimo</mat-label>
                <input matInput type="number" formControlName="estoqueMinimo" min="0">
                <mat-icon matPrefix>warning</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estoque Máximo</mat-label>
                <input matInput type="number" formControlName="estoqueMaximo" min="0">
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Informações Fiscais</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>NCM</mat-label>
                <input matInput formControlName="ncm" maxlength="8">
                <mat-icon matPrefix>receipt</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CEST</mat-label>
                <input matInput formControlName="cest" maxlength="7">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CFOP</mat-label>
                <input matInput formControlName="cfop" maxlength="4">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Alíquota ICMS (%)</mat-label>
                <input matInput type="number" formControlName="aliquotaICMS" step="0.01" min="0">
                <span matSuffix>&nbsp;%</span>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Configurações</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="toggles">
              <mat-slide-toggle formControlName="ativo" color="primary">
                Produto Ativo
              </mat-slide-toggle>

              <mat-slide-toggle formControlName="permiteDesconto" color="primary">
                Permite Desconto
              </mat-slide-toggle>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="form-actions">
          <button mat-button type="button" routerLink="/produtos">
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="!produtoForm.valid || loading">
            <mat-icon>save</mat-icon>
            {{ isEdit ? 'Atualizar' : 'Cadastrar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
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

    mat-card {
      margin-bottom: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .col-2 {
      grid-column: span 2;
    }

    .col-3 {
      grid-column: span 3;
    }

    .toggles {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .col-2,
      .col-3 {
        grid-column: span 1;
      }
    }
  `]
})
export class ProdutoFormComponent implements OnInit {
  produtoForm!: FormGroup;
  categorias: Categoria[] = [];
  isEdit = false;
  produtoId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.carregarCategorias();
    
    this.produtoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.produtoId) {
      this.isEdit = true;
      this.carregarProduto();
    }

    this.setupMargemCalculation();
  }

  createForm(): void {
    this.produtoForm = this.fb.group({
      descricao: ['', Validators.required],
      descricaoDetalhada: [''],
      codigoBarras: [''],
      codigoInterno: [''],
      categoriaId: ['', Validators.required],
      unidadeMedida: ['UN', Validators.required],
      precoCompra: [0, [Validators.required, Validators.min(0)]],
      precoVenda: [0, [Validators.required, Validators.min(0)]],
      margemLucro: [{value: 0, disabled: true}],
      estoqueAtual: [0, [Validators.required, Validators.min(0)]],
      estoqueMinimo: [0, Validators.min(0)],
      estoqueMaximo: [null],
      ncm: [''],
      cest: [''],
      cfop: [''],
      aliquotaICMS: [0],
      ativo: [true],
      permiteDesconto: [true]
    });
  }

  setupMargemCalculation(): void {
    this.produtoForm.get('precoCompra')?.valueChanges.subscribe(() => this.calcularMargem());
    this.produtoForm.get('precoVenda')?.valueChanges.subscribe(() => this.calcularMargem());
  }

  calcularMargem(): void {
    const compra = this.produtoForm.get('precoCompra')?.value || 0;
    const venda = this.produtoForm.get('precoVenda')?.value || 0;
    
    if (compra > 0) {
      const margem = ((venda - compra) / compra) * 100;
      this.produtoForm.get('margemLucro')?.setValue(margem.toFixed(2));
    }
  }

  carregarCategorias(): void {
    this.apiService.get<Categoria[]>('categorias/ativas').subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      }
    });
  }

  carregarProduto(): void {
    this.produtoService.getById(this.produtoId!).subscribe({
      next: (produto) => {
        this.produtoForm.patchValue(produto);
      }
    });
  }

  onSubmit(): void {
    if (this.produtoForm.valid) {
      this.loading = true;
      const produto: Produto = this.produtoForm.getRawValue();

      const operation = this.isEdit
        ? this.produtoService.update(this.produtoId!, produto)
        : this.produtoService.create(produto);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Produto ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
            'Fechar',
            { duration: 3000 }
          );
          this.router.navigate(['/produtos']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            error.error?.message || 'Erro ao salvar produto',
            'Fechar',
            { duration: 5000 }
          );
        }
      });
    }
  }
}