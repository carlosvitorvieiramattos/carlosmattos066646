import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localePt);

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Roteamento com suporte a transições suaves
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withViewTransitions() 
    ),

    // Cliente HTTP com o Interceptor de Autenticação
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // Animações para feedback visual
    provideAnimations(),

    

    // Define o idioma padrão do sistema como Português do Brasil
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};