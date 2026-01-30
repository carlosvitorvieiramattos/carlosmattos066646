import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthState } from '../state/auth.state';
import { tap, catchError } from 'rxjs/operators';
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

  
  login(credenciais: { username: string; senha: string }): Observable<LoginResponse> { 
    const payload = {
      username: credenciais.username,
      password: credenciais.senha
    };

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, payload)
      .pipe(
        tap(res => {
          this.state.setTokens(res.access_token, res.refresh_token);
          
          this.router.navigate(['/dashboard']);
        }),
        catchError(err => {
          let msg = 'Falha na conexão com o sistema.';
          if (err.status === 401) msg = 'Usuário ou senha inválidos.';
          
          return throwError(() => new Error(msg));
        })
      );
  }

  
  logout(): void { 
    this.state.clearSession(); 
    this.router.navigate(['/autenticacao/login']);
  }

 
  get estaLogado() { 
    return this.state.isAuthenticated(); 
  }
}