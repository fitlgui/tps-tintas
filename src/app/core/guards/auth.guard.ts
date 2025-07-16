// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/admin/admin.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Injetamos os serviços que precisamos dentro da função
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos o status de login e se a sessão ainda é válida
  if (authService.isLoggedIn() && authService.isSessionValid()) {
    return true; // Se estiver logado e sessão válida, permite o acesso à rota
  }

  // Se não estiver logado ou sessão expirada, faz logout e redireciona para login
  if (authService.isLoggedIn() && !authService.isSessionValid()) {
    console.log('Sessão expirada. Fazendo logout automático...');
    authService.logout();
  }

  console.log('Acesso negado. Redirecionando para /login...');
  router.navigate(['/login']);
  return false; // E bloqueia o acesso à rota atual
};
