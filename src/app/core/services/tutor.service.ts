import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { firstValueFrom, map, tap, lastValueFrom, filter } from 'rxjs';
import { Pet } from './pet.service';

export interface TutorFoto {
  id?: number;
  nome?: string;         
  url: string;          
  contentType?: string; 
}

export interface Tutor {
  id: number; // ID geralmente é obrigatório na resposta
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: number; 
  pets?: Pet[];
  foto?: TutorFoto; 
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
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async getTutorById(id: number | string): Promise<Tutor> {
    return firstValueFrom(this.http.get<Tutor>(`${this.apiUrl}/${id}`));
  }

  async addTutor(payload: Partial<Tutor>): Promise<Tutor> {
    return firstValueFrom(this.http.post<Tutor>(this.apiUrl, payload));
  }

  async atualizarTutor(id: number | string, payload: Partial<Tutor>): Promise<Tutor> {
    return firstValueFrom(this.http.put<Tutor>(`${this.apiUrl}/${id}`, payload));
  }

  async excluirTutor(id: number | string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    this._tutores.update(lista => lista.filter(t => t.id !== Number(id)));
  }

   
  async uploadFoto(id: number | string, arquivo: File): Promise<TutorFoto> {
    const formData = new FormData();
    formData.append('foto', arquivo);

    this.uploadProgress.set(0);

    const upload$ = this.http.post<TutorFoto>(`${this.apiUrl}/${id}/fotos`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      tap((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
        }
      }),
      // Filtra para que o Observable só emita o valor final (HttpResponse)
      filter((event): event is HttpResponse<TutorFoto> => event.type === HttpEventType.Response),
      map(res => res.body as TutorFoto)
    );

    // lastValueFrom espera o fluxo fechar, evitando o erro "canceled"
    return await lastValueFrom(upload$);
  }

  async vincularPet(tutorId: number | string, petId: number | string): Promise<void> {
    // Retornamos firstValueFrom para garantir a conclusão antes do componente seguir
    return await firstValueFrom(this.http.post<void>(`${this.apiUrl}/${tutorId}/pets/${petId}`, {}));
  }

  async desvincularPet(tutorId: number | string, petId: number | string): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${tutorId}/pets/${petId}`));
  }
}