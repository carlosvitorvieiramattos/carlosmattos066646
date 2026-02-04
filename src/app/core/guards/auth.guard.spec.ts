import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './auth.guard'; 
import { AuthService } from '../services/auth.service';
import { AuthState } from '../state/auth.state';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'clear');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('deve permitir acesso (return true) se o usuário já estiver autenticado', async () => {

    (localStorage.getItem as jasmine.Spy).and.returnValue('token-valido');

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeTrue();
    expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
  });

  it('deve tentar refresh se não autenticado mas existir refresh_token no storage', async () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null); 
    
    authServiceSpy.refreshToken.and.resolveTo(true);

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeTrue();
    expect(authServiceSpy.refreshToken).toHaveBeenCalled();
  });

  it('deve redirecionar para login se não houver tokens (nem auth nem refresh)', async () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null); // Sem token no storage
    authServiceSpy.refreshToken.and.resolveTo(false);

    const result = await executeGuard(mockRoute, mockState);

    // Espera que retorne false e navegue
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('deve redirecionar para login e limpar storage se o refresh falhar (lançar erro)', async () => {
    // Cenário: Não tem token, tenta refresh mas falha com exceção
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    // Simula erro no serviço
    authServiceSpy.refreshToken.and.returnValue(Promise.reject(new Error('Refresh falhou')));

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('deve redirecionar para login se o refresh retornar false (sem erro, mas sem sucesso)', async () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    
    authServiceSpy.refreshToken.and.resolveTo(false); 

    const result = await executeGuard(mockRoute, mockState);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});