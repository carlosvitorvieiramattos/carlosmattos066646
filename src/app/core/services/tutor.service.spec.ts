import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TutorService, PaginatedTutores, Tutor } from './tutor.service';
import { HttpEventType } from '@angular/common/http';

describe('TutorService', () => {
  let service: TutorService;
  let httpMock: HttpTestingController;
  const API_URL = 'https://pet-manager-api.geia.vip/v1/tutores';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TutorService]
    });
    service = TestBed.inject(TutorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve carregar tutores e atualizar o signal tutores', async () => {
    const mockData: PaginatedTutores = {
      content: [{ id: 1, nome: 'Carlos Mattos', email: 'carlos@pjc.mt.gov.br', cpf: 123, endereco: 'Cuiabá', telefone: '65' }],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    };

    const promise = service.carregarTutores('Carlos');

    const req = httpMock.expectOne(req => 
      req.url === API_URL && req.params.get('nome') === 'Carlos'
    );
    req.flush(mockData);

    const res = await promise;
    expect(res.content.length).toBe(1);
    expect(service.tutores()).toEqual(mockData.content);
  });

  it('deve gerenciar o progresso de upload da foto', async () => {
    const tutorId = 1;
    const mockFile = new File([''], 'avatar.png', { type: 'image/png' });
    const mockResponse = { url: 'http://img.png' };

    const promise = service.uploadFoto(tutorId, mockFile);

    const req = httpMock.expectOne(`${API_URL}/${tutorId}/fotos`);
    
    // Simula o evento de progresso
    req.event({
      type: HttpEventType.UploadProgress,
      loaded: 50,
      total: 100
    });
    expect(service.uploadProgress()).toBe(50);

    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(jasmine.objectContaining(mockResponse));
  });

  it('deve remover tutor do signal local após exclusão', async () => {
    // Preparação: Inserir um tutor no signal privado para testar a remoção
    const mockTutor = { id: 1, nome: 'Carlos' } as Tutor;
    // Acessando a propriedade privada para simular estado inicial
    (service as any)._tutores.set([mockTutor]); 
    
    expect(service.tutores().length).toBe(1);

    const promise = service.excluirTutor(1);
    const req = httpMock.expectOne(`${API_URL}/1`);
    req.flush(null);

    await promise;
    
    expect(service.tutores().length).toBe(0);
  });

  it('deve vincular um pet ao tutor via POST', async () => {
    const promise = service.vincularPet(1, 10);

    const req = httpMock.expectOne(`${API_URL}/1/pets/10`);
    expect(req.request.method).toBe('POST');
    req.flush(null);

    await expectAsync(promise).toBeResolved();
  });
});