import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tutor } from '../model/tutor.model';

// Interface ajustada conforme o OpenAPI da sua API (Pagina proprietária paginadaDto)
interface PaginatedTutorResponse {
  content: Tutor[];
  total: number; // Corrigido de totalElements para total
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
   * O servidor retorna um recorte (content) e o total geral de registros (total).
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
      
      // Atualiza a lista com os itens da página atual
      this._listaTutores.set(res.content || []);
      
      // ATENÇÃO: Aqui res.total agora mapeia corretamente para o valor da API (ex: 41)
      this._totalElementos.set(res.total || 0);
      
    } catch (error) {
      console.error('Erro ao buscar tutores:', error);
      this._listaTutores.set([]);
      this._totalElementos.set(0);
    } finally {
      this._loading.set(false);
    }
  }

  async vincularPetAoTutor(tutorId: number, petId: number): Promise<void> {
    try {
      // Endpoint POST /v1/tutores/{id}/pets/{petId}
      await firstValueFrom(
        this.http.post(`${this.API_URL}/${tutorId}/pets/${petId}`, {})
      );
    } catch (error) {
      throw new Error('Não foi possível vincular o animal.');
    }
  }

  async desvincularPetDoTutor(tutorId: number, petId: number): Promise<void> {
    try {
      // Endpoint DELETE /v1/tutores/{id}/pets/{petId}
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/${tutorId}/pets/${petId}`)
      );
    } catch (error) {
      throw new Error('Erro ao remover vínculo.');
    }
  }

  async excluirTutor(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.API_URL}/${id}`));
      this._listaTutores.update(tutores => tutores.filter(t => t.id !== id));
      this._totalElementos.update(total => Math.max(0, total - 1));
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