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

  it('deve tentar fazer refresh do token ao receber erro 401', () => {
    localStorage.setItem('access_token', 'token-expirado');
    authServiceSpy.refreshToken.and.returnValue(Promise.resolve(true));

    httpClient.get('/api/protegido').subscribe();

    const reqs = httpMock.match('/api/protegido');
    expect(reqs.length).toBeGreaterThan(0);
    reqs[0].flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Verifica que tentou fazer refresh
    expect(authServiceSpy.refreshToken).toHaveBeenCalled();
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