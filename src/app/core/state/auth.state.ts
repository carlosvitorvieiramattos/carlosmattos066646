import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthState {
  // 1. Mantemos os signals privados para controle total da escrita
  private readonly _accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem('refresh_token'));

  // 2. Expomos como Readonly para que outros componentes apenas leiam
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();

  // 3. Estado derivado (reativo)
  readonly isAuthenticated = computed(() => !!this._accessToken());

  /**
   * Atualiza os tokens tanto no estado da aplicação quanto no storage.
   */
  setTokens(access: string | null, refresh: string | null) {
    // Atualiza os Signals
    this._accessToken.set(access);
    this._refreshToken.set(refresh);
    
    // Sincroniza com LocalStorage
    this.updateStorage('access_token', access);
    this.updateStorage('refresh_token', refresh);
  }

  /**
   * Atalho para limpar a sessão no logout
   */
  clearSession() {
    this.setTokens(null, null);
  }

  /**
   * Método auxiliar privado para evitar repetição de lógica
   */
  private updateStorage(key: string, value: string | null) {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}