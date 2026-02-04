import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// --- INTERFACES ---
export interface PetFoto {
  id: number;
  nome: string;        
  contentType: string; 
  url: string;         
}

export interface Pet {
  id: number;
  nome: string;
  raca: string;
  idade: number;
  foto?: PetFoto;      
  tutores?: any[];
  observacoes?: string;
}

export interface PaginatedPets {
  content: Pet[];
  totalElements: number;
  totalPages: number;    
  number: number;        
  pageCount?: number;    
  page?: number;         
}

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);
  private readonly API = 'https://pet-manager-api.geia.vip/v1/pets';
  
  private readonly _pets = signal<Pet[]>([]);
  private readonly _loading = signal<boolean>(false);

  readonly pets = this._pets.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  readonly totalPetsCarregados = computed(() => this._pets().length);

  // --- MÉTODOS ---

 
  async carregarPets(
    nome: string = '', 
    page: number = 0, 
    size: number = 10, 
    raca: string = '', 
    sort: string = 'id,desc' 
  ): Promise<PaginatedPets> {
    this._loading.set(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort); // Envia a ordenação para o backend

    if (nome) params = params.set('nome', nome);
    if (raca) params = params.set('raca', raca);

    try {
      const res = await firstValueFrom(this.http.get<PaginatedPets>(this.API, { params }));
      this._pets.set(res?.content ?? []);
      return res;
    } catch (error) {
      this._pets.set([]);
      console.error('Falha ao conectar com o servidor da PJC-MT:', error);
      throw new Error('Erro ao carregar a base de dados de animais.');
    } finally {
      this._loading.set(false);
    }
  }
  
  async getPetById(id: number): Promise<Pet> {
    return firstValueFrom(this.http.get<Pet>(`${this.API}/${id}`));
  }

  async addPet(pet: Partial<Pet>): Promise<Pet> {
    return firstValueFrom(this.http.post<Pet>(this.API, pet));
  }

  async updatePet(id: number, payload: Partial<Pet>): Promise<Pet> {
    return firstValueFrom(this.http.put<Pet>(`${this.API}/${id}`, payload));
  }

  async deletePet(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.API}/${id}`));
    this._pets.update(current => current.filter(p => p.id !== id));
  }

  async uploadFoto(id: number, file: File): Promise<PetFoto> {
    const formData = new FormData();
    formData.append('foto', file, file.name); 
    
    return firstValueFrom(this.http.post<PetFoto>(`${this.API}/${id}/fotos`, formData));
  }
}