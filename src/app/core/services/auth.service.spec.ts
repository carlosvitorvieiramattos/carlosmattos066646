import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthState } from '../state/auth.state';
import { Router } from '@angular/router';

describe('AuthService', () => { 
  let service: AuthService;
  let httpMock: HttpTestingController;
  let authState: AuthState;
  let routerSpy: jasmine.SpyObj<Router>;

  // Rota conforme definido no serviço real
  const LOGIN_ROUTE = '/login';

  beforeEach(() => {
    localStorage.clear();
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        AuthState,
        { provide: Router, useValue: spy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    authState = TestBed.inject(AuthState);
    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    // Garante que nenhuma requisição ficou pendente (Exigência de qualidade)
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve armazenar o access_token e atualizar o Signal ao fazer login', async () => {
    const mockResponse = { 
      access_token: 'token-123', 
      refresh_token: 'ref-123',
      expires_in: 3600 
    };
    
    const credentials = { username: 'admin', password: 'admin' }; 

    const loginPromise = service.login(credentials);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const resultado = await loginPromise;
    
    expect(resultado).toBeTrue();
    expect(localStorage.getItem('access_token')).toBe('token-123');
    // Verifica se a reatividade (Signals) funcionou
    expect(authState.isAuthenticated()).toBeTrue();
  });

  it('deve remover os tokens e navegar para login ao fazer logout', () => {
    authState.setTokens('token-antigo', 'refresh-antigo');
    
    service.logout();
    
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(authState.isAuthenticated()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith([LOGIN_ROUTE]);
  });

  it('deve renovar o access_token usando o refresh_token via PUT', async () => {
    const oldRefreshToken = 'refresh-123';
    const newAccessToken = 'novo-token-999';
    localStorage.setItem('refresh_token', oldRefreshToken);

    const refreshPromise = service.refreshToken();

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/refresh');
    expect(req.request.method).toBe('PUT');
    
    // O Refresh Token DEVE ir no Header Authorization (Exigência do Swagger)
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${oldRefreshToken}`);

    req.flush({ access_token: newAccessToken, refresh_token: oldRefreshToken });

    const resultado = await refreshPromise;

    expect(resultado).toBeTrue();
    expect(localStorage.getItem('access_token')).toBe(newAccessToken);
    expect(authState.isAuthenticated()).toBeTrue();
  });

  it('deve limpar a sessão e redirecionar se o refresh_token falhar (401)', async () => {
    localStorage.setItem('refresh_token', 'expirado');
    
    const refreshPromise = service.refreshToken();

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/autenticacao/refresh');
    // Simula erro de credencial inválida conforme Documentação
    req.error(new ErrorEvent('Unauthorized'), { status: 401 });

    const resultado = await refreshPromise;

    expect(resultado).toBeFalse();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith([LOGIN_ROUTE]);
  });
});