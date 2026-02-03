import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { AuthService } from './core/services/auth.service';
import { AuthState } from './core/state/auth.state'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // Simplificado: RouterModule já traz RouterLink, RouterLinkActive e RouterOutlet
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  // Injetamos o AuthService para usar a lógica de saída
  private authService = inject(AuthService);
  
  // Injetamos o AuthState como PUBLIC para que o HTML consiga ler authState.isAuthenticated()
  public authState = inject(AuthState); 

  sair(): void {
    // Basta chamar o logout do serviço, ele cuidará de limpar o localStorage e redirecionar
    this.authService.logout();
  }
}