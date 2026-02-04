import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthState } from '../state/auth.state'; // Verifique se o caminho está correto
import { tap, catchError, firstValueFrom } from 'rxjs';
import { throwError, Observable } from 'rxjs';

/**
 * Interface de resposta conforme Página 2 do PDF da API
 */
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly http = inject(HttpClient);
  private readonly state = inject(AuthState);
  private readonly router = inject(Router);
  
  private readonly API_URL = 'https://pet-manager-api.geia.vip/autenticacao';

  
  async login(credenciais: { username: string; password: string }): Promise<boolean> {
    // Transformamos o Observable em Promise para o componente usar o try/catch
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API_URL}/login`, credenciais)
      );

      if (response && response.access_token) {
        this.state.setTokens(response.access_token, response.refresh_token);
        // O redirecionamento pode ser feito aqui ou no componente. 
        // Se fizer aqui, o componente apenas confirma o sucesso.
        return true;
      }
      return false;
    } catch (err: any) {
      // Repassamos o erro para o componente tratar a mensagem (401, 500, etc)
      throw err;
    }
  }

  logout(): void { 
    this.state.clearSession(); 
    this.router.navigate(['/autenticacao/login']);
  }

  get estaLogado(): boolean { 
    return this.state.isAuthenticated(); 
  }
}