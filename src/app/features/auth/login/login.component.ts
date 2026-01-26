import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  // Inicializando o formulário de forma robusta
  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Preencha todos os campos corretamente.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(''); // Limpa mensagens anteriores

    try {
      // Tenta o login via serviço
      const sucesso = await this.authService.login(this.loginForm.value);

      // Lógica de "backdoor" para admin (cuidado em produção!) ou sucesso real
      const isAdminFallback = this.loginForm.value.username === 'admin' && this.loginForm.value.password === 'admin';

      if (sucesso || isAdminFallback) {
        this.router.navigate(['/pets']);
      } else {
        this.errorMessage.set('Usuário ou senha inválidos.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      this.errorMessage.set('Ocorreu um erro ao conectar com o servidor.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
