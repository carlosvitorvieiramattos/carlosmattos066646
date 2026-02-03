import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PetService, PaginatedPets, Pet } from './pet.service'; // Ajuste o caminho se necessário

describe('PetService', () => {
  let service: PetService;
  let httpMock: HttpTestingController;

  const API_URL = 'https://pet-manager-api.geia.vip/v1/pets';

  // Mock de dados reutilizável
  const mockPet: Pet = {
    id: 1,
    nome: 'Rex',
    raca: 'Pastor Alemão',
    idade: 5,
    foto: { id: 10, nome: 'foto.jpg', contentType: 'image/jpeg', url: 'http://url' }
  };

  const mockPaginatedResponse: PaginatedPets = {
    content: [mockPet],
    totalElements: 1,
    totalPages: 1,
    number: 0
  };

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

  describe('carregarPets', () => {
    it('deve atualizar o Signal "pets" e "loading" ao carregar com sucesso', async () => {
      // 1. Inicia a chamada
      const promise = service.carregarPets();

      // 2. Verifica o estado de loading (síncrono, logo após chamar)
      expect(service.loading()).toBeTrue();

      // 3. Intercepta a requisição
      const req = httpMock.expectOne(req => req.url === API_URL && req.method === 'GET');
      
      // Verifica parâmetros padrão
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('sort')).toBe('id,desc');

      // 4. Retorna os dados simulados
      req.flush(mockPaginatedResponse);

      // 5. Aguarda a promise resolver
      await promise;

      // 6. Verifica estado final dos Signals
      expect(service.pets()).toEqual([mockPet]);
      expect(service.loading()).toBeFalse();
      expect(service.totalPetsCarregados()).toBe(1);
    });

    it('deve enviar parâmetros de filtro (nome e raça) corretamente', async () => {
      service.carregarPets('Rex', 0, 10, 'Pastor');

      const req = httpMock.expectOne(req => 
        req.url === API_URL && 
        req.params.get('nome') === 'Rex' && 
        req.params.get('raca') === 'Pastor'
      );

      req.flush(mockPaginatedResponse);
    });

    it('deve lidar com erro na API e resetar a lista de pets', async () => {
      const promise = service.carregarPets();

      const req = httpMock.expectOne(API_URL);
      // Simula erro 500
      req.flush('Erro no servidor', { status: 500, statusText: 'Internal Server Error' });

      try {
        await promise;
        fail('Deveria ter lançado um erro');
      } catch (error) {
        expect(error).toEqual(new Error('Erro ao carregar a base de dados de animais.'));
      }

      expect(service.pets()).toEqual([]); // Deve limpar a lista em caso de erro
      expect(service.loading()).toBeFalse();
    });
  });

  describe('getPetById', () => {
    it('deve buscar um pet pelo ID', async () => {
      const promise = service.getPetById(1);

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPet);

      const resultado = await promise;
      expect(resultado).toEqual(mockPet);
    });
  });

  describe('addPet', () => {
    it('deve enviar requisição POST com o corpo correto', async () => {
      const novoPet: Partial<Pet> = { nome: 'Totó', idade: 2 };
      
      const promise = service.addPet(novoPet);

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(novoPet);

      req.flush({ ...novoPet, id: 2 });
      
      await promise;
    });
  });

  describe('updatePet', () => {
    it('deve enviar requisição PUT para atualizar', async () => {
      const payload: Partial<Pet> = { nome: 'Rex Atualizado' };
      
      const promise = service.updatePet(1, payload);

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      req.flush({ ...mockPet, ...payload });
      
      await promise;
    });
  });

  describe('deletePet', () => {
    it('deve enviar requisição DELETE e remover o item do Signal localmente', async () => {
      // 1. Pré-configuração: Popula o signal com 2 pets
      const petParaDeletar = { ...mockPet, id: 1 };
      const petParaManter = { ...mockPet, id: 2, nome: 'Outro' };
      
      // Hack: Chamamos carregarPets para popular o estado inicial antes do teste de delete
      const loadPromise = service.carregarPets();
      const loadReq = httpMock.expectOne(req => req.method === 'GET');
      loadReq.flush({ ...mockPaginatedResponse, content: [petParaDeletar, petParaManter] });
      await loadPromise;

      expect(service.pets().length).toBe(2); // Confirma que temos 2 pets

      // 2. Executa o Delete
      const deletePromise = service.deletePet(1);

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null); // Retorno vazio (204 No Content)

      await deletePromise;

      // 3. Verifica se o Signal foi atualizado (id 1 deve sumir, id 2 deve ficar)
      expect(service.pets().length).toBe(1);
      expect(service.pets()[0].id).toBe(2);
    });
  });

  describe('uploadFoto', () => {
    it('deve enviar requisição POST com FormData', async () => {
      const mockFile = new File([''], 'teste.jpg', { type: 'image/jpeg' });
      
      const promise = service.uploadFoto(1, mockFile);

      const req = httpMock.expectOne(`${API_URL}/1/fotos`);
      expect(req.request.method).toBe('POST');
      
      // Verifica se o corpo é um FormData e se contém o arquivo
      expect(req.request.body instanceof FormData).toBeTrue();
      expect(req.request.body.has('foto')).toBeTrue();

      req.flush(mockPet.foto!);

      await promise;
    });
  });
});