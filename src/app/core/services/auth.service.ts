import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, from, Observable } from 'rxjs';
import { AuthState } from '../state/auth.state';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  
  // URL base sem a versão /v1 para autenticação, conforme PDF
  private readonly BASE_URL = 'https://pet-manager-api.geia.vip/autenticacao';

  /**
   * Ajustado para receber exatamente o que o login.component envia:
   * { username: 'admin', password: 'admin' }
   */
  async login(credenciais: any): Promise<boolean> {
    try {
      // O payload deve ser exatamente {"username": "...", "password": "..."}
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.BASE_URL}/login`, credenciais)
      );

      if (res?.access_token) {
        // Armazena no AuthState e no LocalStorage através do seu state
        this.authState.setTokens(res.access_token, res.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login PJC-MT:', error);
      return false;
    }
  }

  /**
   * Renovação de token via PUT conforme Página 2 do PDF
   */
  async refreshToken(): Promise<boolean> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return false;

    try {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${refresh}`);
      
      const res = await firstValueFrom(
        this.http.put<AuthResponse>(`${this.BASE_URL}/refresh`, {}, { headers })
      );

      if (res?.access_token) {
        this.authState.setTokens(res.access_token, res.refresh_token || refresh);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Falha na renovação do token:', error);
      this.logout(); 
      return false;
    }
  }

  refreshTokenObservable(): Observable<boolean> {
    return from(this.refreshToken());
  }

  logout(): void {
    this.authState.clearSession(); 
    // Redireciona para a rota configurada no seu app.routes
    this.router.navigate(['/login']);
  }

  // Método auxiliar para os Guards
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}