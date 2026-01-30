import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tutor } from '../model/tutor.model';

// Interface de Paginação conforme Página 17 do Swagger
interface PaginatedTutorResponse {
  content: Tutor[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class TutorFacade {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://pet-manager-api.geia.vip/v1/tutores';

  // State Management reativo
  private readonly _tutor = signal<Tutor | null>(null);
  
  // Exposição segura dos dados (Readonly)
  readonly tutor = this._tutor.asReadonly();
  readonly temTutorCarregado = computed(() => !!this._tutor());

  /**
   * Carrega os dados do tutor.
   * Ajustado para lidar com o objeto de paginação da API GEIA (Quarkus).
   */
  async carregarPerfil(): Promise<void> {
    try {
      // O Swagger indica que este endpoint é paginado (Pág. 11 do PDF)
      const res = await firstValueFrom(
        this.http.get<PaginatedTutorResponse>(this.API_URL)
      );
      
      // Acessa .content para validar a lista
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

  /**
   * Vincula um Pet ao Tutor selecionado
   * Conforme Página 16 do PDF (POST /v1/tutores/{id}/pets/{petId})
   */
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