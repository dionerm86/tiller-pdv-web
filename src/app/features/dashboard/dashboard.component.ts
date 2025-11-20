import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router, RouterModule } from '@angular/router';

interface DashboardCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p class="subtitle">Visão geral do sistema</p>

      <div class="stats-grid">
        <mat-card *ngFor="let card of cards" class="stat-card" [class]="card.color">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>{{ card.icon }}</mat-icon>
              <span class="stat-title">{{ card.title }}</span>
            </div>
            <div class="stat-value">{{ card.value }}</div>
            <button *ngIf="card.route" mat-button [routerLink]="card.route">
              Ver mais <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/pdv" class="action-btn">
            <mat-icon>point_of_sale</mat-icon>
            <span>Nova Venda</span>
          </button>
          <button mat-raised-button color="accent" routerLink="/produtos/novo" class="action-btn">
            <mat-icon>add_box</mat-icon>
            <span>Novo Produto</span>
          </button>
          <button mat-raised-button routerLink="/clientes/novo" class="action-btn">
            <mat-icon>person_add</mat-icon>
            <span>Novo Cliente</span>
          </button>
          <button mat-raised-button routerLink="/relatorios" class="action-btn">
            <mat-icon>analytics</mat-icon>
            <span>Relatórios</span>
          </button>
        </div>
      </div>

      <div class="alerts-section">
        <mat-card class="alert-card warning">
          <mat-card-content>
            <mat-icon>warning</mat-icon>
            <div class="alert-content">
              <strong>Atenção!</strong>
              <p>5 produtos com estoque abaixo do mínimo</p>
            </div>
            <button mat-button routerLink="/estoque">Ver Produtos</button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .subtitle {
      margin: 0 0 32px 0;
      color: #666;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card.blue { border-top: 4px solid #2196f3; }
    .stat-card.green { border-top: 4px solid #4caf50; }
    .stat-card.orange { border-top: 4px solid #ff9800; }
    .stat-card.purple { border-top: 4px solid #9c27b0; }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .stat-title {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #333;
      margin-bottom: 12px;
    }

    .stat-card button {
      color: #667eea;
    }

    .quick-actions {
      margin-bottom: 40px;
    }

    .quick-actions h2 {
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-btn {
      height: 80px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 16px;
    }

    .action-btn mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .alerts-section {
      margin-top: 40px;
    }

    .alert-card {
      border-left: 4px solid #ff9800;
    }

    .alert-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .alert-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ff9800;
    }

    .alert-content {
      flex: 1;
    }

    .alert-content strong {
      display: block;
      margin-bottom: 4px;
      color: #333;
    }

    .alert-content p {
      margin: 0;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  cards: DashboardCard[] = [
    {
      title: 'Vendas Hoje',
      value: 'R$ 2.450,00',
      icon: 'trending_up',
      color: 'blue',
      route: '/vendas'
    },
    {
      title: 'Produtos Cadastrados',
      value: '245',
      icon: 'inventory_2',
      color: 'green',
      route: '/produtos'
    },
    {
      title: 'Clientes Ativos',
      value: '89',
      icon: 'people',
      color: 'orange',
      route: '/clientes'
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 45,80',
      icon: 'receipt_long',
      color: 'purple'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Carregar dados reais da API
  }
}