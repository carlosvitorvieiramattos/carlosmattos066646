import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PetFormComponent } from './pet-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PetService } from '@core/services/pet.service';
import { of } from 'rxjs';

describe('PetFormComponent', () => {
  let component: PetFormComponent;
  let fixture: ComponentFixture<PetFormComponent>;
  
  // Mock do PetService
  const petServiceMock = {
    addPet: jasmine.createSpy('addPet'),
    updatePet: jasmine.createSpy('updatePet'),
    uploadFoto: jasmine.createSpy('uploadFoto'),
    getPetById: jasmine.createSpy('getPetById').and.returnValue(Promise.resolve({ id: 1, nome: 'Rex' }))
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetFormComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: PetService, useValue: petServiceMock },
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

  it('deve chamar addPet quando o formulário for válido', fakeAsync(() => {
    component.petForm.patchValue({
      nome: 'Thor',
      raca: 'Labrador',
      idade: 3
    });

    petServiceMock.addPet.and.returnValue(Promise.resolve({ id: 10, nome: 'Thor' }));
    petServiceMock.uploadFoto.and.returnValue(Promise.resolve({}));

    component.onSubmit();
    
    tick();

    expect(petServiceMock.addPet).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/pets']);
  }));

  it('deve exibir erro se o cadastro falhar', fakeAsync(() => {
    petServiceMock.addPet.and.returnValue(Promise.reject('Erro de API'));
    
    component.petForm.patchValue({ nome: 'Thor', raca: 'Labrador', idade: 3 });
    
    component.onSubmit();
    tick();

    expect(component.petForm.value.nome).toBe('Thor');
  }));
});