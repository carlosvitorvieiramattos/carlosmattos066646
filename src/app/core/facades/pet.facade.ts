import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Pet } from '../model/pet.model';
import { PetService } from '../services/pet.service'; 

@Injectable({ providedIn: 'root' })
export class PetFacade {
  private readonly http = inject(HttpClient);
  private readonly petService = inject(PetService); 
  private readonly API_URL = 'https://pet-manager-api.geia.vip/v1/pets';

  
  async cadastrarPet(pet: Partial<Pet>): Promise<Pet> {
    try {
      const novoPet = await firstValueFrom(
        this.http.post<Pet>(this.API_URL, pet)
      );
      
      this.petService.carregarPets(); 
      
      return novoPet;
    } catch (error) {
      throw new Error('Falha ao salvar os dados do pet. Verifique os campos obrigatórios.');
    }
  }

  
  async uploadFoto(petId: number, foto: File): Promise<any> {
    const formData = new FormData();
    formData.append('foto', foto); 

    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.API_URL}/${petId}/fotos`, formData)
      );
    } catch (error) {
      throw new Error('Erro ao processar a imagem. O formato deve ser JPG ou PNG.');
    }
  }
}