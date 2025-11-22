import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../core/services/auth.service';
import { Usuario } from '../core/model/usuario.model';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
                   [attr.role]="'navigation'"
                   [mode]="'side'"
                   [opened]="true">
        <div class="sidebar-header">
          <mat-icon class="logo">point_of_sale</mat-icon>
          <h2>SmartPDV</h2>
        </div>

        <mat-nav-list>
          <a mat-list-item *ngFor="let item of menuItems" 
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: false}">
            <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
            <span matListItemTitle>{{item.title}}</span>
          </a>
        </mat-nav-list>

        <div class="sidebar-footer">
          <mat-divider></mat-divider>
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.nome }}</span>
              <span class="user-role">{{ currentUser?.perfil }}</span>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="toolbar-spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
            <mat-icon [matBadge]="notificationCount" matBadgeColor="warn">notifications</mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- Menu de Notificações -->
    <mat-menu #notificationMenu="matMenu">
      <button mat-menu-item>
        <mat-icon>inventory_2</mat-icon>
        <span>5 produtos com estoque baixo</span>
      </button>
      <button mat-menu-item>
        <mat-icon>receipt</mat-icon>
        <span>3 notas fiscais pendentes</span>
      </button>
    </mat-menu>

    <!-- Menu do Usuário -->
    <mat-menu #userMenu="matMenu">
      <div class="user-menu-header">
        <strong>{{ currentUser?.nome }}</strong>
        <small>{{ currentUser?.email }}</small>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item routerLink="/configuracoes">
        <mat-icon>settings</mat-icon>
        <span>Configurações</span>
      </button>
      <button mat-menu-item (click)="logout()">
        <mat-icon>exit_to_app</mat-icon>
        <span>Sair</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 260px;
      background: #2c3e50;
      color: white;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 24px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .sidebar-header .logo {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    mat-nav-list {
      padding-top: 16px;
    }

    mat-nav-list a {
      color: #ecf0f1;
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.3s;
      font-weight: 500;
    }

    mat-nav-list a:hover {
      background: rgba(255,255,255,0.15);
      color: white;
    }

    mat-nav-list a.active {
      background: rgba(102, 126, 234, 0.3);
      color: white;
      font-weight: 600;
    }

    mat-nav-list a mat-icon {
      color: #bdc3c7;
    }

    mat-nav-list a:hover mat-icon,
    mat-nav-list a.active mat-icon {
      color: #fff;
    }

    .sidebar-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      margin-top: 16px;
    }

    .user-info mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #ecf0f1;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
      color: #ecf0f1;
    }

    .user-role {
      font-size: 12px;
      color: #bdc3c7;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .main-content {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    .user-menu-header {
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .user-menu-header strong {
      margin-bottom: 4px;
    }

    .user-menu-header small {
      color: #666;
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: Usuario | null = null;
  notificationCount = 8;

  menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { title: 'PDV (Caixa)', icon: 'point_of_sale', route: '/pdv' },
    { title: 'Produtos', icon: 'inventory_2', route: '/produtos' },
    { title: 'Clientes', icon: 'people', route: '/clientes' },
    { title: 'Vendas', icon: 'receipt_long', route: '/vendas' },
    { title: 'Estoque', icon: 'warehouse', route: '/estoque' },
    { title: 'Caixa', icon: 'account_balance_wallet', route: '/caixa' },
    { title: 'Relatórios', icon: 'analytics', route: '/relatorios', roles: ['Admin', 'Gerente'] },
    { title: 'Configurações', icon: 'settings', route: '/configuracoes', roles: ['Admin'] }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.filterMenuByRole();
    });
  }

  filterMenuByRole(): void {
    if (this.currentUser) {
      this.menuItems = this.menuItems.filter(item => 
        !item.roles || item.roles.includes(this.currentUser!.perfil)
      );
    }
  }

  logout(): void {
    this.authService.logout();
  }
}