import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem('refresh_token'));

  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();

  readonly isAuthenticated = computed(() => !!this._accessToken());

  
  setTokens(access: string | null, refresh: string | null) {
    this._accessToken.set(access);
    this._refreshToken.set(refresh);
    
    this.updateStorage('access_token', access);
    this.updateStorage('refresh_token', refresh);
  }

  
  clearSession() {
    this.setTokens(null, null);
  }

  
  private updateStorage(key: string, value: string | null) {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}