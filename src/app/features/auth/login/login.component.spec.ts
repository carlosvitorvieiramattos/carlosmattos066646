import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com formulário vazio', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('deve marcar formulário como inválido quando vazio', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('deve fazer login com sucesso', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(Promise.resolve(true));

    component.loginForm.patchValue({
      username: 'admin',
      password: 'admin'
    });

    component.onSubmit();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin'
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('deve exibir erro quando login falhar por credenciais inválidas', fakeAsync(() => {
    const error = { status: 401 };
    authServiceSpy.login.and.returnValue(Promise.reject(error));

    component.loginForm.patchValue({
      username: 'admin',
      password: 'wrong'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage()).toContain('Credenciais inválidas');
  }));

  it('deve exibir erro de conexão quando status é 0', fakeAsync(() => {
    const error = { status: 0 };
    authServiceSpy.login.and.returnValue(Promise.reject(error));

    component.loginForm.patchValue({
      username: 'admin',
      password: 'admin'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage()).toContain('comunicar com o servidor');
  }));

  it('deve exibir erro genérico para outros status', fakeAsync(() => {
    const error = { status: 500 };
    authServiceSpy.login.and.returnValue(Promise.reject(error));

    component.loginForm.patchValue({
      username: 'admin',
      password: 'admin'
    });

    component.onSubmit();
    tick();

    expect(component.errorMessage()).toContain('servidor da PJC-MT');
  }));

  it('deve desabilitar o envio quando formulário é inválido', () => {
    expect(component.loginForm.invalid).toBeTrue();
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('deve mostrar loading durante o login', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(new Promise(resolve => {
      setTimeout(() => resolve(true), 100);
    }));

    component.loginForm.patchValue({
      username: 'admin',
      password: 'admin'
    });

    expect(component.isLoading()).toBeFalse();

    component.onSubmit();
    expect(component.isLoading()).toBeTrue();

    tick(100);

    expect(component.isLoading()).toBeFalse();
  }));

  it('deve limpar erro ao alterar o formulário', fakeAsync(() => {
    component.errorMessage.set('Erro anterior');

    component.loginForm.patchValue({
      username: 'novo'
    });

    tick();

    expect(component.errorMessage()).toBeNull();
  }));

  it('deve validar campo username obrigatório', () => {
    const usernameControl = component.loginForm.get('username');
    
    usernameControl?.setValue('');
    expect(usernameControl?.hasError('required')).toBeTrue();

    usernameControl?.setValue('admin');
    expect(usernameControl?.hasError('required')).toBeFalse();
  });

  it('deve validar comprimento mínimo do username', () => {
    const usernameControl = component.loginForm.get('username');
    
    usernameControl?.setValue('ab');
    expect(usernameControl?.hasError('minlength')).toBeTrue();

    usernameControl?.setValue('admin');
    expect(usernameControl?.hasError('minlength')).toBeFalse();
  });
});
