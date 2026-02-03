import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service'; // Usando o Alias que você configurou!
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  // Dica: Se estiver no Angular 17+, o CommonModule muitas vezes é dispensável 
  // se você usar a nova sintaxe de controle de fluxo (@if, @for).
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para estado da UI
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Formulário com tipagem implícita forte
  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  constructor() {
    // Limpa a mensagem de erro automaticamente quando o usuário volta a digitar
    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.errorMessage()) {
          this.errorMessage.set(null);
        }
      });
  }

  ngOnInit(): void {}

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Enviando apenas os valores brutos para o serviço
      const sucesso = await this.authService.login(this.loginForm.getRawValue());

      if (sucesso) {
        await this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Usuário ou senha incorretos.');
      }
    } catch (error: any) {
      // Melhoria no tratamento de erro baseado no status HTTP
      if (error?.status === 401) {
        this.errorMessage.set('Credenciais inválidas. Verifique os dados.');
      } else if (error?.status === 0) {
        this.errorMessage.set('Não foi possível comunicar com o servidor. Verifique sua conexão.');
      } else {
        this.errorMessage.set('Erro ao conectar com o servidor da PJC-MT.');
      }
      console.error('Login Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Getters para facilitar o acesso no HTML (ex: u?.errors)
  get u() { return this.loginForm.get('username'); }
  get p() { return this.loginForm.get('password'); }
}