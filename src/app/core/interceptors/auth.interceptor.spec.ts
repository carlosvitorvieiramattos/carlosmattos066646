import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['refreshToken', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: spy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve adicionar o header Authorization se o token existir', () => {
    localStorage.setItem('access_token', 'token-123');

    httpClient.get('/api/teste').subscribe();

    const req = httpMock.expectOne('/api/teste');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('deve ignorar endpoints de login e refresh', () => {
    httpClient.get('/autenticacao/login').subscribe();
    
    const req = httpMock.expectOne('/autenticacao/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });

  it('deve tentar fazer refresh do token ao receber erro 401', (done) => {
    localStorage.setItem('access_token', 'token-expirado');
    authServiceSpy.refreshToken.and.returnValue(Promise.resolve(true));

    // 1. Faz uma requisição inicial
    httpClient.get('/api/protegido').subscribe({
      next: () => {
        expect(authServiceSpy.refreshToken).toHaveBeenCalled();
        done();
      }
    });

    // 2. Simula a falha 401 na primeira tentativa
    const reqInicial = httpMock.expectOne('/api/protegido');
    reqInicial.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // 3. O interceptor chama o refreshToken. Agora simulamos o novo token no localStorage
    localStorage.setItem('access_token', 'novo-token');

    // 4. O interceptor deve repetir a requisição automaticamente. Capturamos a repetição:
    const reqRepetida = httpMock.expectOne('/api/protegido');
    expect(reqRepetida.request.headers.get('Authorization')).toBe('Bearer novo-token');
    
    reqRepetida.flush({ sucesso: true });
  });

  it('deve fazer logout se o refresh token falhar', (done) => {
    authServiceSpy.refreshToken.and.returnValue(Promise.resolve(false));

    httpClient.get('/api/protegido').subscribe({
      error: (err) => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(err.message).toContain('Sessão expirada');
        done();
      }
    });

    const req = httpMock.expectOne('/api/protegido');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});