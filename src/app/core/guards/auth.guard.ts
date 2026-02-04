import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  // Se tem token, permite o acesso
  if (token) {
    return true;
  }

  try {
    const sucessoRefresh = await authService.refreshToken();

    if (sucessoRefresh) {
      return true;
    }
  } catch (error) {
    // Trata erros do refresh
    console.error('Erro ao fazer refresh:', error);
  }

  // Se tudo falhar, manda para o login
  router.navigate(['/login']);
  return false;
};