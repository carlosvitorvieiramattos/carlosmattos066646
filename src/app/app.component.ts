import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { AuthService } from './core/services/auth.service';
import { AuthState } from './core/state/auth.state'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private authService = inject(AuthService);
  
  public authState = inject(AuthState); 

  sair(): void {
    this.authService.logout();
  }
}