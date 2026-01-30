import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tutor } from '../model/tutor.model';

interface PaginatedTutorResponse {
  content: Tutor[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class TutorFacade {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://pet-manager-api.geia.vip/v1/tutores';

  private readonly _tutor = signal<Tutor | null>(null);
  
  readonly tutor = this._tutor.asReadonly();
  readonly temTutorCarregado = computed(() => !!this._tutor());

  
  async carregarPerfil(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<PaginatedTutorResponse>(this.API_URL)
      );
      
      if (res && res.content && res.content.length > 0) {
        this._tutor.set(res.content[0]);
      } else {
        this._tutor.set(null);
      }
    } catch (error) {
      this._tutor.set(null);
      console.error('Erro ao carregar perfil:', error);
      throw new Error('Falha na comunicação com o banco de dados de tutores.');
    }
  }

  
  async vincularPetAoTutor(tutorId: number, petId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/${tutorId}/pets/${petId}`, {})
      );
    } catch (error) {
      throw new Error('Não foi possível vincular o animal a este tutor.');
    }
  }

  limparDados(): void {
    this._tutor.set(null);
  }
}