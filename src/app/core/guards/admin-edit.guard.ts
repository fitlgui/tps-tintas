// src/app/core/guards/admin-edit.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/admin/admin.service';

export const adminEditGuard: CanActivateFn = (route, state) => {
  // Injetamos os serviços que precisamos dentro da função
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos se está logado e se a sessão ainda é válida
  if (!authService.isLoggedIn() || !authService.isSessionValid()) {
    console.log('Usuário não logado ou sessão expirada. Redirecionando para /login...');
    router.navigate(['/login']);
    return false;
  }

  // Verificamos se o usuário pode editar (apenas admin)
  if (!authService.canEdit()) {
    console.log('Usuário não tem permissão para editar. Redirecionando para área de visualização...');
    // Redireciona para uma página de visualização baseada na rota atual
    const currentPath = state.url;
    
    if (currentPath.includes('/users/')) {
      router.navigate(['/admin/users']);
    } else if (currentPath.includes('/products/')) {
      router.navigate(['/admin/produtos']);
    } else {
      router.navigate(['/admin/home']);
    }
    
    // Mostrar mensagem de aviso
    alert('Apenas administradores podem realizar alterações.');
    return false;
  }

  return true; // Permite o acesso se for admin
};
