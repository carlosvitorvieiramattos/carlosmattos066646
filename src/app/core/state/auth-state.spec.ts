import { TestBed } from '@angular/core/testing';
import { AuthState } from '../state/auth.state';

describe('AuthState', () => {
  let service: AuthState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthState);
    localStorage.clear(); // Garante isolamento entre os testes
  });

  it('deve iniciar com estado não autenticado (null)', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.accessToken()).toBeNull();
  });

  it('deve atualizar signals e localStorage ao chamar setTokens', () => {
    const token = 'fake-jwt';
    const refresh = 'fake-refresh';

    service.setTokens(token, refresh);

    // Verifica Signals (Reatividade)
    expect(service.accessToken()).toBe(token);
    expect(service.isAuthenticated()).toBeTrue();

    // Verifica Persistência (LocalStorage)
    expect(localStorage.getItem('access_token')).toBe(token);
    expect(localStorage.getItem('refresh_token')).toBe(refresh);
  });

  it('deve limpar tudo ao chamar clearSession', () => {
    service.setTokens('token', 'refresh');
    service.clearSession();

    expect(service.accessToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('deve carregar estado inicial do localStorage', () => {
    // Simula token já existente antes do serviço carregar
    localStorage.setItem('access_token', 'token-existente');
    
    // Criamos uma nova instância para testar o construtor
    const newService = new AuthState();
    
    expect(newService.accessToken()).toBe('token-existente');
    expect(newService.isAuthenticated()).toBeTrue();
  });
});