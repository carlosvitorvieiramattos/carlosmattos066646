import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetService, PaginatedPets, Pet } from './pet.service';

describe('PetService', () => {
  let service: PetService;
  let httpMock: HttpTestingController;
  const API_URL = 'https://pet-manager-api.geia.vip/v1/pets';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PetService]
    });
    service = TestBed.inject(PetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garante que não há requisições pendentes
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve carregar pets e atualizar o signal de pets', async () => {
    const mockResponse: PaginatedPets = {
      content: [{ id: 1, nome: 'Rex', raca: 'Vira-lata', idade: 3 }],
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const promise = service.carregarPets();

    const req = httpMock.expectOne(req => req.url === API_URL && req.params.has('page'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    const result = await promise;

    // Verificações
    expect(result.content.length).toBe(1);
    expect(service.pets()).toEqual(mockResponse.content); 
    expect(service.totalPetsCarregados()).toBe(1); // Valida o Computed
  });

  it('deve lidar com erro ao carregar pets', async () => {
    const promise = service.carregarPets();

    const req = httpMock.expectOne(req => req.url === API_URL);
    req.error(new ErrorEvent('Network error'));

    try {
      await promise;
    } catch (error: any) {
      expect(error.message).toBe('Erro ao carregar a base de dados de animais.');
    }

    expect(service.pets().length).toBe(0);
    expect(service.loading()).toBeFalse();
  });

  it('deve deletar um pet e atualizar o signal localmente', async () => {
    const initialPet: Pet = { id: 123, nome: 'Bobi', raca: 'Poodle', idade: 5 };
    
    const promise = service.deletePet(123);

    const req = httpMock.expectOne(`${API_URL}/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await promise;
    
    expect(service.pets().find(p => p.id === 123)).toBeUndefined();
  });
});