import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { Pet } from './pet.service';

export interface TutorFoto {
  id?: number;
  nome?: string;         
  url: string;          
  contentType?: string; 
}

export interface Tutor {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number; // Alterado para number (int64) conforme a especificação [cite: 377, 396]
  pets?: Pet[];
  foto?: TutorFoto; // Conforme o esquema da resposta 
}

export interface PaginatedTutores {
  content: Tutor[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;      
}

@Injectable({ providedIn: 'root' })
export class TutorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://pet-manager-api.geia.vip/v1/tutores';
  
  private readonly _tutores = signal<Tutor[]>([]);
  private readonly _loading = signal<boolean>(false);
  
  // Signal para monitorar o progresso do upload (0 a 100)
  readonly uploadProgress = signal<number>(0);

  readonly tutores = this._tutores.asReadonly();
  readonly loading = this._loading.asReadonly();

  async carregarTutores(nome: string = '', page: number = 0, size: number = 10): Promise<PaginatedTutores> {
    this._loading.set(true);
    try {
      const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('nome', nome);
        
      const dados = await firstValueFrom(this.http.get<PaginatedTutores>(this.apiUrl, { params }));
      this._tutores.set(dados.content || []);
      return dados; 
    } catch (error) {
      this._tutores.set([]);
      throw new Error('Erro ao sincronizar com a base de dados de tutores.');
    } finally {
      this._loading.set(false);
    }
  }

  async getTutorById(id: number | string): Promise<Tutor> {
    return firstValueFrom(this.http.get<Tutor>(`${this.apiUrl}/${id}`));
  }

  async addTutor(payload: Partial<Tutor>): Promise<Tutor> {
    // Nota: O payload deve conter o CPF como número [cite: 377]
    return firstValueFrom(this.http.post<Tutor>(this.apiUrl, payload));
  }

  async atualizarTutor(id: number | string, payload: Partial<Tutor>): Promise<Tutor> {
    return firstValueFrom(this.http.put<Tutor>(`${this.apiUrl}/${id}`, payload));
  }

  async excluirTutor(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    this._tutores.update(lista => lista.filter(t => t.id !== Number(id)));
  }

  /**
   * Realiza o upload da foto com rastreio de progresso
   * Endpoint: POST /v1/tutores/{id}/fotos [cite: 441]
   */
  async uploadFoto(id: number | string, arquivo: File): Promise<TutorFoto> {
    const formData = new FormData();
    formData.append('foto', arquivo); // Campo 'foto' obrigatório 

    this.uploadProgress.set(0);

    const upload$ = this.http.post<TutorFoto>(`${this.apiUrl}/${id}/fotos`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
        }
      })
      
    );

    const finalEvent = await firstValueFrom(upload$);
    return (finalEvent as any).body as TutorFoto;
  }

  async vincularPet(tutorId: number | string, petId: number | string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.apiUrl}/${tutorId}/pets/${petId}`, {}));
  }

  async desvincularPet(tutorId: number | string, petId: number | string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${tutorId}/pets/${petId}`));
  }
}