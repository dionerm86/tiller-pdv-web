import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-abrir-caixa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>account_balance_wallet</mat-icon>
      Abrir Caixa
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <p class="info-text">
          Informe o valor inicial do caixa (fundo de troco)
        </p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor de Abertura</mat-label>
          <input matInput type="number" formControlName="valorAbertura"
                 placeholder="100.00" step="0.01" min="0" autofocus>
          <span matPrefix>R$&nbsp;</span>
          <mat-icon matPrefix>attach_money</mat-icon>
          <mat-error *ngIf="form.get('valorAbertura')?.hasError('required')">
            Valor é obrigatório
          </mat-error>
          <mat-error *ngIf="form.get('valorAbertura')?.hasError('min')">
            Valor deve ser maior ou igual a zero
          </mat-error>
        </mat-form-field>

        <div class="suggestions">
          <p><small>Valores sugeridos:</small></p>
          <div class="suggestion-buttons">
            <button mat-stroked-button type="button" (click)="setValor(50)">
              R$ 50,00
            </button>
            <button mat-stroked-button type="button" (click)="setValor(100)">
              R$ 100,00
            </button>
            <button mat-stroked-button type="button" (click)="setValor(200)">
              R$ 200,00
            </button>
            <button mat-stroked-button type="button" (click)="setValor(500)">
              R$ 500,00
            </button>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary"
              (click)="confirmar()"
              [disabled]="!form.valid">
        <mat-icon>check_circle</mat-icon>
        Abrir Caixa
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
    }

    mat-dialog-content {
      padding: 20px 24px;
      min-width: 400px;
    }

    .info-text {
      color: #666;
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .suggestions {
      margin-top: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .suggestions p {
      margin: 0 0 12px 0;
      color: #666;
    }

    .suggestion-buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `]
})
export class AbrirCaixaDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AbrirCaixaDialogComponent>
  ) {
    this.form = this.fb.group({
      valorAbertura: [100, [Validators.required, Validators.min(0)]]
    });
  }

  setValor(valor: number): void {
    this.form.patchValue({ valorAbertura: valor });
  }

  confirmar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.valorAbertura);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}