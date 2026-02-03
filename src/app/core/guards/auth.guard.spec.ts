import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './auth.guard'; 
import { AuthService } from '../services/auth.service';
import { AuthState } from '../state/auth.state';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let authStateSpy: jasmine.SpyObj<AuthState>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Função auxiliar para executar o guard dentro do contexto de injeção
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  // Snapshots falsos para simular a rota
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    // Criando os Spies (Mocks)
    authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    authStateSpy = jasmine.createSpyObj('AuthState', ['isAuthenticated'], {
      refreshToken: null 
    });
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'clear');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthState, useValue: authStateSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('deve permitir acesso (return true) se o usuário já estiver autenticado', async () => {
    // Cenário: isAuthenticated retorna true
    authStateSpy.isAuthenticated.and.returnValue(true);

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeTrue();
    expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
  });

  it('deve tentar refresh se não autenticado mas existir refresh_token no storage', async () => {
    // Cenário: Não autenticado, mas tem token no localStorage
    authStateSpy.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue('refresh-token-valido');
    
    // Simula que o refresh funcionou
    authServiceSpy.refreshToken.and.resolveTo(true);

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeTrue();
    expect(authServiceSpy.refreshToken).toHaveBeenCalled();
  });

  it('deve redirecionar para login se não houver tokens (nem auth nem refresh)', async () => {
    // Cenário: Tudo vazio
    authStateSpy.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue(null); // Sem token no storage
    
    // Configura o retorno do router (UrlTree)
    const urlTreeMock = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTreeMock);

    const result = await executeGuard(mockRoute, mockState);

    // Espera que retorne o UrlTree de redirecionamento
    expect(result).toBe(urlTreeMock);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], { 
      queryParams: { returnUrl: '/dashboard' } 
    });
  });

  it('deve redirecionar para login e limpar storage se o refresh falhar (lançar erro)', async () => {
    // Cenário: Tem token, mas o refresh dá erro (ex: token expirado no servidor)
    authStateSpy.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue('token-inválido');

    // Simula erro no serviço
    authServiceSpy.refreshToken.and.rejectWith(new Error('Refresh falhou'));
    
    const urlTreeMock = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTreeMock);

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBe(urlTreeMock);
    expect(localStorage.clear).toHaveBeenCalled(); // Verifica o catch(error)
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login'], { 
      queryParams: { returnUrl: '/dashboard' } 
    });
  });

  it('deve redirecionar para login se o refresh retornar false (sem erro, mas sem sucesso)', async () => {
    // Cenário: Refresh roda, mas retorna false
    authStateSpy.isAuthenticated.and.returnValue(false);
    (localStorage.getItem as jasmine.Spy).and.returnValue('token-existente');
    
    authServiceSpy.refreshToken.and.resolveTo(false); 
    
    const urlTreeMock = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTreeMock);

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBe(urlTreeMock);
  });
});