import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Clientes</h1>
        <button mat-raised-button color="primary" routerLink="/clientes/novo">
          <mat-icon>add</mat-icon>
          Novo Cliente
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div class="em-desenvolvimento">
            <mat-icon>construction</mat-icon>
            <h2>Módulo em Desenvolvimento</h2>
            <p>Esta funcionalidade estará disponível em breve.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 32px; }
    .em-desenvolvimento {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    .em-desenvolvimento mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ff9800;
    }
  `]
})
export class ClientesListComponent {}