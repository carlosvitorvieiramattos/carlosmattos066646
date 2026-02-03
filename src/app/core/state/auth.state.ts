import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem('refresh_token'));

 
  readonly isAuthenticated = computed(() => !!this._accessToken());

 
  get accessToken() { return this._accessToken(); }
  get refreshToken() { return this._refreshToken(); }

  
  setTokens(access: string | null, refresh: string | null) {
    this._accessToken.set(access);
    this._refreshToken.set(refresh);
    
    if (access) {
      localStorage.setItem('access_token', access);
    } else {
      localStorage.removeItem('access_token');
    }

    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }

  
  clearSession() {
    this.setTokens(null, null);
  }
}