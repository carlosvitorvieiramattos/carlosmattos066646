import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PetFormComponent } from './pet-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetFacade } from '@core/facades/pet.facade';
import { TutorFacade } from '@core/facades/tutor.facade';
import { of } from 'rxjs';

describe('PetFormComponent', () => {
  let component: PetFormComponent;
  let fixture: ComponentFixture<PetFormComponent>;
  
  // Criamos o mock com os nomes exatos da sua Facade
  const petFacadeMock = {
    cadastrarPet: jasmine.createSpy('cadastrarPet'),
    uploadFoto: jasmine.createSpy('uploadFoto'),
    // Caso use o getPetById para edição, mantenha-o aqui:
    getPetById: jasmine.createSpy('getPetById').and.returnValue(Promise.resolve({ id: 1, nome: 'Rex' }))
  };

  const tutorFacadeMock = {
    // Simulando o Signal ou Observable de tutores
    tutores: () => [{ id: 1, nome: 'Carlos' }], 
    carregarTutores: jasmine.createSpy('carregarTutores')
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetFormComponent, ReactiveFormsModule],
      providers: [
        { provide: PetFacade, useValue: petFacadeMock },
        { provide: TutorFacade, useValue: tutorFacadeMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } } // Simula criação (sem ID na URL)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve chamar cadastrarPet quando o formulário for válido', fakeAsync(() => {
    // 1. Preenche o formulário
    component.petForm.patchValue({
      nome: 'Thor',
      especie: 'Cão',
      tutorId: 1
    });

    // 2. Configura o mock para retornar uma Promise resolvida
    petFacadeMock.cadastrarPet.and.returnValue(Promise.resolve({ id: 10, nome: 'Thor' }));

    // 3. Dispara o envio
    component.onSubmit();
    
    // 4. Resolve as Promises
    tick();

    expect(petFacadeMock.cadastrarPet).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/pets']);
  }));

  it('deve exibir erro se o cadastro falhar', fakeAsync(() => {
    petFacadeMock.cadastrarPet.and.returnValue(Promise.reject('Erro de API'));
    
    component.petForm.patchValue({ nome: 'Thor', especie: 'Cão', tutorId: 1 });
    
    component.onSubmit();
    tick();

   
  }));
});