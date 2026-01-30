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

  /**
   * Realiza o login convertendo os dados do formulário 
   * para os nomes exigidos pelo Swagger (username/password)
   */
  login(credenciais: { email: string; senha: string }): Observable<LoginResponse> { 
    // Mapeamento necessário para compatibilidade com o backend Quarkus da PJC-MT
    const payload = {
      username: credenciais.email,
      password: credenciais.senha
    };

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, payload)
      .pipe(
        tap(res => {
          // Atualiza o estado global e persiste os tokens
          this.state.setTokens(res.access_token, res.refresh_token);
          
          // Navegação para a rota protegida definida no Edital
          this.router.navigate(['/dashboard']);
        }),
        catchError(err => {
          let msg = 'Falha na conexão com o sistema.';
          if (err.status === 401) msg = 'Usuário ou senha inválidos.';
          
          return throwError(() => new Error(msg));
        })
      );
  }

  /**
   * Encerra a sessão limpando o estado reativo e o armazenamento local
   */
  logout(): void { 
    this.state.clearSession(); 
    this.router.navigate(['/autenticacao/login']);
  }

  /**
   * Expõe o estado de autenticação (Signal)
   */
  get estaLogado() { 
    return this.state.isAuthenticated(); // Retorna o valor do Signal
  }
}