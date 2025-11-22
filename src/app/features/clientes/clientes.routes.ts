import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./clientes-list/clientes-list.component').then(m => m.ClientesListComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./cliente-form/cliente-form.component').then(m => m.ClienteFormComponent)
  }
];