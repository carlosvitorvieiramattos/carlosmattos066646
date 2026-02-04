import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TutorFacade } from './tutor.facade';

describe('TutorFacade', () => {
  let service: TutorFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TutorFacade]
    });

    service = TestBed.inject(TutorFacade);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve ter signals para estado dos tutores', () => {
    expect(service.listaTutores).toBeDefined();
    expect(service.isLoading).toBeDefined();
    expect(service.totalElementos).toBeDefined();
  });
});
