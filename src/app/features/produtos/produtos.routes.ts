import { Routes } from '@angular/router';

export const PRODUTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./produtos-list/produtos-list.component').then(m => m.ProdutosListComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./produto-form/produto-form.component').then(m => m.ProdutoFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./produto-form/produto-form.component').then(m => m.ProdutoFormComponent)
  }
];