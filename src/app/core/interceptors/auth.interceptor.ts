import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn, 
  HttpEvent, 
  HttpErrorResponse 
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, throwError, catchError, switchMap, BehaviorSubject, filter, take, from } from 'rxjs';

// Variáveis de controle de estado (fila de espera)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 1. Ignora endpoints de autenticação
  if (req.url.includes('/autenticacao/login') || req.url.includes('/autenticacao/refresh')) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  let authReq = req;

  // 2. Anexa o token atual se ele existir
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 3. Processa a requisição e trata erros
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// Função auxiliar tipada corretamente
const handle401Error = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService
): Observable<HttpEvent<unknown>> => {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Trava a fila

    return from(authService.refreshToken()).pipe(
      switchMap((sucesso: boolean) => {
        isRefreshing = false;
        
        // Se o serviço retornou true, significa que o token novo JÁ ESTÁ no localStorage
        if (sucesso) {
          const novoToken = localStorage.getItem('access_token');
          
          if (novoToken) {
            // Avisa a fila que o token chegou
            refreshTokenSubject.next(novoToken);
            
            // Reenvia a requisição original
            return next(req.clone({
              setHeaders: { Authorization: `Bearer ${novoToken}` }
            }));
          }
        }

        // Se falhou (retornou false ou token não veio)
        authService.logout();
        return throwError(() => new Error('Sessão expirada. Faça login novamente.'));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      })
    );
  } 
  
  else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null), // Espera até ter valor
      take(1), // Pega apenas um valor e encerra
      switchMap((jwt) => {
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${jwt}` }
        }));
      })
    );
  }
};