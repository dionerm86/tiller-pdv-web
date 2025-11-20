import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button routerLink="/clientes">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Novo Cliente</h1>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div class="em-desenvolvimento">
            <mat-icon>construction</mat-icon>
            <h2>Formulário em Desenvolvimento</h2>
            <p>Use o módulo de Produtos como referência para implementar.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 24px; }
    .header { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; }
    .em-desenvolvimento { text-align: center; padding: 60px 20px; color: #666; }
    .em-desenvolvimento mat-icon { font-size: 80px; width: 80px; height: 80px; color: #ff9800; }
  `]
})
export class ClienteFormComponent {}