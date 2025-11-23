import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

interface ConfigSection {
  title: string;
  icon: string;
  description: string;
  items: ConfigItem[];
}

interface ConfigItem {
  name: string;
  description: string;
  route?: string;
  status?: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="config-container">
      <div class="header">
        <div>
          <h1>Configurações</h1>
          <p class="subtitle">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <!-- Cards de Configuração -->
      <div class="config-grid">
        <mat-card *ngFor="let section of configSections" class="config-card">
          <mat-card-header>
            <div class="card-header-content">
              <mat-icon class="section-icon">{{ section.icon }}</mat-icon>
              <div>
                <mat-card-title>{{ section.title }}</mat-card-title>
                <mat-card-subtitle>{{ section.description }}</mat-card-subtitle>
              </div>
            </div>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let item of section.items; let last = last">
                <div class="list-item-content">
                  <div class="item-info">
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.description }}</small>
                  </div>
                  <div class="item-actions">
                    <mat-chip *ngIf="item.status" 
                              [class.chip-active]="item.status === 'active'"
                              [class.chip-inactive]="item.status === 'inactive'"
                              [class.chip-pending]="item.status === 'pending'">
                      {{ getStatusLabel(item.status) }}
                    </mat-chip>
                    <button mat-icon-button *ngIf="item.route" [routerLink]="item.route">
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                    <button mat-icon-button *ngIf="!item.route" (click)="emDesenvolvimento()">
                      <mat-icon>settings</mat-icon>
                    </button>
                  </div>
                </div>
                <mat-divider *ngIf="!last"></mat-divider>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Informações do Sistema -->
      <mat-card class="system-info-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>info</mat-icon>
            Informações do Sistema
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Versão:</span>
              <span class="value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">Ambiente:</span>
              <mat-chip class="chip-active">Produção</mat-chip>
            </div>
            <div class="info-item">
              <span class="label">Banco de Dados:</span>
              <span class="value">SQL Server</span>
            </div>
            <div class="info-item">
              <span class="label">Último Backup:</span>
              <span class="value">{{ dataUltimoBackup | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .config-container {
      padding: 24px;
    }

    .header {
      margin-bottom: 32px;
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

    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .config-card {
      transition: box-shadow 0.3s;
    }

    .config-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .card-header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .section-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .list-item-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 12px 0;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-info strong {
      font-size: 16px;
      color: #333;
    }

    .item-info small {
      font-size: 13px;
      color: #666;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chip-active {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .chip-inactive {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .chip-pending {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    .system-info-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .system-info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item .label {
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
      font-weight: 600;
    }

    .info-item .value {
      font-size: 18px;
      font-weight: 700;
    }

    @media (max-width: 768px) {
      .config-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConfiguracoesComponent {
  dataUltimoBackup = new Date();

  configSections: ConfigSection[] = [
    {
      title: 'Empresa',
      icon: 'business',
      description: 'Dados da empresa e estabelecimento',
      items: [
        { 
          name: 'Dados da Empresa', 
          description: 'Razão social, CNPJ, endereço',
          status: 'pending'
        },
        { 
          name: 'Logo e Identidade Visual', 
          description: 'Upload de logo e cores do sistema',
          status: 'inactive'
        },
        { 
          name: 'Certificado Digital', 
          description: 'Configurar certificado A1 para NF-e',
          status: 'inactive'
        }
      ]
    },
    {
      title: 'Usuários e Permissões',
      icon: 'people',
      description: 'Gerenciar usuários e acessos',
      items: [
        { 
          name: 'Usuários do Sistema', 
          description: 'Adicionar, editar ou remover usuários',
          status: 'active',
          route: '/configuracoes/usuarios'
        },
        { 
          name: 'Perfis de Acesso', 
          description: 'Configurar permissões por perfil',
          status: 'active'
        },
        { 
          name: 'Logs de Auditoria', 
          description: 'Histórico de ações no sistema',
          status: 'pending'
        }
      ]
    },
    {
      title: 'Fiscal',
      icon: 'receipt',
      description: 'Configurações fiscais e tributárias',
      items: [
        { 
          name: 'Parâmetros Fiscais', 
          description: 'Regime tributário, alíquotas',
          status: 'inactive'
        },
        { 
          name: 'NF-e / NFC-e', 
          description: 'Configurar emissão de notas fiscais',
          status: 'inactive'
        },
        { 
          name: 'SAT / CF-e', 
          description: 'Configurar SAT fiscal',
          status: 'inactive'
        }
      ]
    },
    {
      title: 'Integrações',
      icon: 'sync',
      description: 'Conexões com sistemas externos',
      items: [
        { 
          name: 'TEF / Gateway de Pagamento', 
          description: 'Integrar máquinas de cartão',
          status: 'inactive'
        },
        { 
          name: 'E-commerce', 
          description: 'Sincronizar com loja virtual',
          status: 'inactive'
        },
        { 
          name: 'Backup Automático', 
          description: 'Configurar backups na nuvem',
          status: 'pending'
        }
      ]
    },
    {
      title: 'Sistema',
      icon: 'settings',
      description: 'Configurações gerais do sistema',
      items: [
        { 
          name: 'Preferências Gerais', 
          description: 'Moeda, formato de data, fuso horário',
          status: 'active'
        },
        { 
          name: 'E-mail e Notificações', 
          description: 'SMTP, alertas automáticos',
          status: 'pending'
        },
        { 
          name: 'Manutenção e Limpeza', 
          description: 'Limpar dados antigos, otimizar BD',
          status: 'active'
        }
      ]
    }
  ];

  getStatusLabel(status: string): string {
    const labels: any = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente'
    };
    return labels[status] || status;
  }

  emDesenvolvimento(): void {
    alert('Esta funcionalidade está em desenvolvimento e será disponibilizada em breve!');
  }
}