import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="logo-container">
            <mat-icon class="logo-icon">point_of_sale</mat-icon>
            <h1>SmartPDV</h1>
          </div>
          <p class="subtitle">Sistema de Frente de Caixa</p>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu@email.com">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                E-mail é obrigatório
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                E-mail inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="senha">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('senha')?.hasError('required')">
                Senha é obrigatória
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              <mat-icon>error</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    class="full-width login-button"
                    [disabled]="loginForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">Entrar</span>
            </button>
          </form>

          <div class="demo-info">
            <p><strong>Demo:</strong></p>
            <p>Email: admin@smartpdv.com</p>
            <p>Senha: Admin@123</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .logo-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 10px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      background: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .demo-info {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }

    .demo-info p {
      margin: 4px 0;
    }

    mat-spinner {
      display: inline-block;
      margin: 0 auto;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Email ou senha inválidos';
        }
      });
    }
  }
}