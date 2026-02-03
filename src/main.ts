import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // Certifique-se que o nome está correto

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));