import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthFacade } from './auth.facade';
import { AuthState } from '../state/auth.state';
import { Router } from '@angular/router';

describe('AuthFacade', () => {
  let service: AuthFacade;
  let authStateSpy: jasmine.SpyObj<AuthState>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authStateMock = jasmine.createSpyObj('AuthState', ['setTokens', 'clearSession']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthFacade,
        { provide: AuthState, useValue: authStateMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthFacade);
    authStateSpy = TestBed.inject(AuthState) as jasmine.SpyObj<AuthState>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve fazer logout e limpar sessão', () => {
    service.logout();

    expect(authStateSpy.clearSession).toHaveBeenCalled();
  });

  it('deve verificar se usuário está autenticado', () => {
    // Implementar conforme seu método
    expect(service).toBeTruthy();
  });
});
