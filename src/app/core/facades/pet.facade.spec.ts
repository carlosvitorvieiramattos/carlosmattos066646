import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetFacade } from './pet.facade';
import { PetService } from '../services/pet.service';

describe('PetFacade', () => {
  let service: PetFacade;
  let httpMock: HttpTestingController;
  let petServiceSpy: jasmine.SpyObj<PetService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('PetService', ['carregarPets']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PetFacade,
        { provide: PetService, useValue: spy }
      ]
    });

    service = TestBed.inject(PetFacade);
    httpMock = TestBed.inject(HttpTestingController);
    petServiceSpy = TestBed.inject(PetService) as jasmine.SpyObj<PetService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve cadastrar um novo pet com sucesso', async () => {
    const novoPet = { nome: 'Fluffy', raca: 'Gato', idade: 2 };
    const mockResponse = { id: 1, ...novoPet };

    const promise = service.cadastrarPet(novoPet);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novoPet);
    req.flush(mockResponse);

    const resultado = await promise;

    expect(resultado).toEqual(mockResponse);
    expect(petServiceSpy.carregarPets).toHaveBeenCalled();
  });

  it('deve lançar erro ao cadastrar pet com falha na API', async () => {
    const novoPet = { nome: 'Fluffy', raca: 'Gato', idade: 2 };

    const promise = service.cadastrarPet(novoPet);

    const req = httpMock.expectOne('https://pet-manager-api.geia.vip/v1/pets');
    req.error(new ErrorEvent('Network error'), { status: 400 });

    try {
      await promise;
      fail('Deveria ter lançado erro');
    } catch (error: any) {
      expect(error.message).toContain('Falha ao salvar');
    }
  });

  it('deve fazer upload de foto com sucesso', async () => {
    const petId = 1;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = { id: 1, url: 'http://example.com/foto.jpg' };

    const promise = service.uploadFoto(petId, file);

    const req = httpMock.expectOne(`https://pet-manager-api.geia.vip/v1/pets/${petId}/fotos`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const resultado = await promise;

    expect(resultado).toEqual(mockResponse);
  });

  it('deve lançar erro ao fazer upload de foto com falha', async () => {
    const petId = 1;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    const promise = service.uploadFoto(petId, file);

    const req = httpMock.expectOne(`https://pet-manager-api.geia.vip/v1/pets/${petId}/fotos`);
    req.error(new ErrorEvent('Network error'), { status: 400 });

    try {
      await promise;
      fail('Deveria ter lançado erro');
    } catch (error: any) {
      expect(error.message).toContain('Erro ao processar');
    }
  });
});
