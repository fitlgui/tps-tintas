// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/admin/admin.service';

export const authGuard: CanActivateFn = (route, state) => {
  // Injetamos os serviços que precisamos dentro da função
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos o status de login usando nosso serviço
  if (authService.isLoggedIn()) {
    return true; // Se estiver logado, permite o acesso à rota
  }

  // Se não estiver logado, redireciona para a página de login
  console.log('Acesso negado. Redirecionando para /login...');
  router.navigate(['/login']);
  return false; // E bloqueia o acesso à rota atual
};
