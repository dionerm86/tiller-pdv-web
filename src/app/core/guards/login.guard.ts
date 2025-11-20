import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    // Se JÁ estiver autenticado, redirecionar para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    // Se NÃO estiver autenticado, permitir acesso ao login
    return true;
  }
}