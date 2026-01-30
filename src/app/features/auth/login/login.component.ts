import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Alterado: username agora é texto puro, não email
  loginForm: FormGroup = this.fb.group({
  // Apenas Validators.required e minLength. REMOVA Validators.email se houver.
  username: ['admin', [Validators.required, Validators.minLength(3)]], 
  password: ['admin', [Validators.required, Validators.minLength(3)]] 
});

  constructor() {
    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.errorMessage()) this.errorMessage.set(null);
      });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const sucesso = await this.authService.login(this.loginForm.value);

      if (sucesso) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Usuário ou senha incorretos.');
      }
    } catch (error: any) {
      if (error.status === 401) {
        this.errorMessage.set('Credenciais inválidas. Verifique os dados.');
      } else {
        this.errorMessage.set('Erro ao conectar com o servidor da PJC-MT.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  get u() { return this.loginForm.get('username'); }
  get p() { return this.loginForm.get('password'); }
}