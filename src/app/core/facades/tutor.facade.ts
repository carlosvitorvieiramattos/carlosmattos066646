import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tutor } from '../model/tutor.model';

interface PaginatedTutorResponse {
  content: Tutor[];
  total: number; 
  size: number;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class TutorFacade {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://pet-manager-api.geia.vip/v1/tutores';

  // --- ESTADOS (Signals) ---
  private readonly _tutor = signal<Tutor | null>(null);
  private readonly _listaTutores = signal<Tutor[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _totalElementos = signal<number>(0); 

  // --- EXPOSIÇÃO PÚBLICA ---
  readonly tutor = this._tutor.asReadonly();
  readonly listaTutores = this._listaTutores.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly totalElementos = this._totalElementos.asReadonly();
  readonly temTutorCarregado = computed(() => !!this._tutor());

  /**
   * Busca tutores de forma paginada.
   */
  async buscarTutores(filtro: string = '', pagina: number = 0, tamanho: number = 10): Promise<void> {
    this._loading.set(true);
    try {
      const params = new HttpParams()
        .set('nome', filtro)
        .set('page', pagina.toString())
        .set('size', tamanho.toString()); 

      const res = await firstValueFrom(
        this.http.get<PaginatedTutorResponse>(this.API_URL, { params })
      );
      
      this._listaTutores.set(res.content || []);
      this._totalElementos.set(res.total || 0);
      
    } catch (error) {
      console.error('Erro ao buscar tutores:', error);
      this._listaTutores.set([]);
      this._totalElementos.set(0);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Busca um tutor específico por ID para carregar no detalhe ou edição.
   */
  async buscarTutorPorId(id: number): Promise<void> {
    this._loading.set(true);
    try {
      const tutor = await firstValueFrom(this.http.get<Tutor>(`${this.API_URL}/${id}`));
      this._tutor.set(tutor);
    } catch (error) {
      console.error('Erro ao buscar tutor por ID:', error);
      this._tutor.set(null);
    } finally {
      this._loading.set(false);
    }
  }

  async vincularPetAoTutor(tutorId: number, petId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/${tutorId}/pets/${petId}`, {})
      );
      // Opcional: Recarregar o tutor atual se ele for o que recebeu o pet
      if (this._tutor()?.id === tutorId) {
        await this.buscarTutorPorId(tutorId);
      }
    } catch (error) {
      throw new Error('Não foi possível vincular o animal.');
    }
  }

  async desvincularPetDoTutor(tutorId: number, petId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/${tutorId}/pets/${petId}`)
      );
      // Atualiza o estado local do tutor detalhado caso ele esteja carregado
      const tutorAtual = this._tutor();
      if (tutorAtual?.id === tutorId) {
        this._tutor.set({
          ...tutorAtual,
          pets: tutorAtual.pets?.filter(p => p.id !== petId) || []
        });
      }
    } catch (error) {
      throw new Error('Erro ao remover vínculo.');
    }
  }

  async excluirTutor(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
      this._listaTutores.update(tutores => tutores.filter(t => t.id !== id));
      this._totalElementos.update(total => Math.max(0, total - 1));
      
      if (this._tutor()?.id === id) {
        this._tutor.set(null);
      }
    } catch (error) {
      throw new Error('Erro ao excluir tutor.');
    }
  }

  limparDados(): void {
    this._tutor.set(null);
    this._listaTutores.set([]);
    this._totalElementos.set(0);
  }
}