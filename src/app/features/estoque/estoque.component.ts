import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="container">
      <h1>Controle de Estoque</h1>
      
      <mat-card>
        <mat-card-content>
          <div class="em-desenvolvimento">
            <mat-icon>construction</mat-icon>
            <h2>Módulo em Desenvolvimento</h2>
            <p>Movimentações, entradas, saídas e ajustes de estoque.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 24px; }
    h1 { margin-bottom: 24px; }
    .em-desenvolvimento { text-align: center; padding: 60px 20px; color: #666; }
    .em-desenvolvimento mat-icon { font-size: 80px; width: 80px; height: 80px; color: #ff9800; }
  `]
})
export class EstoqueComponent {}