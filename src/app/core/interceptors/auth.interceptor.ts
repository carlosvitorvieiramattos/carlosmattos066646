import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, throwError, catchError, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshTokenObservable().pipe(
          switchMap((sucesso) => {
            if (sucesso) {
              const newToken = localStorage.getItem('access_token');
              // Repete a requisição original com o novo token
              return next(req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            }
            
            // Se o refresh falhar, força o logout (limpa storage e redireciona)
            authService.logout();
            return throwError(() => error);
          }),
          // Captura erro caso o próprio refreshTokenObservable falhe drasticamente
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};