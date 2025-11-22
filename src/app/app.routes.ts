import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rota de login SEM guard (público)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  
  // Rotas protegidas COM guard
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'pdv',
        loadComponent: () => import('./features/pdv/pdv.component').then(m => m.PdvComponent)
      },
      {
        path: 'produtos',
        loadChildren: () => import('./features/produtos/produtos.routes').then(m => m.PRODUTOS_ROUTES)
      },
      {
        path: 'clientes',
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      {
        path: 'vendas',
        loadComponent: () => import('./features/vendas/vendas.component').then(m => m.VendasComponent)
      },
      {
        path: 'estoque',
        loadComponent: () => import('./features/estoque/estoque.component').then(m => m.EstoqueComponent)
      },
      {
        path: 'caixa',
        loadComponent: () => import('./features/caixa/caixa.component').then(m => m.CaixaComponent)
      },
      {
        path: 'relatorios',
        loadComponent: () => import('./features/relatorios/relatorios.component').then(m => m.RelatoriosComponent)
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./features/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // Wildcard - redireciona para login se não autenticado
  {
    path: '**',
    redirectTo: 'login'
  }
];