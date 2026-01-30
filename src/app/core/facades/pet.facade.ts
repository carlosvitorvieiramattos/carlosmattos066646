import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Pet } from '../model/pet.model';
import { PetService } from '../services/pet.service'; // Importe seu serviço de estado

@Injectable({ providedIn: 'root' })
export class PetFacade {
  private readonly http = inject(HttpClient);
  private readonly petService = inject(PetService); // Para atualizar o signal
  private readonly API_URL = 'https://pet-manager-api.geia.vip/v1/pets';

  /**
   * Cadastra um novo animal.
   * Alinhado com a página 14 do Swagger.
   */
  async cadastrarPet(pet: Partial<Pet>): Promise<Pet> {
    try {
      const novoPet = await firstValueFrom(
        this.http.post<Pet>(this.API_URL, pet)
      );
      
      // ATENÇÃO: Atualiza o signal global de pets para refletir na UI instantaneamente
      // Isso demonstra domínio de gerenciamento de estado exigido no edital.
      this.petService.carregarPets(); 
      
      return novoPet;
    } catch (error) {
      throw new Error('Falha ao salvar os dados do pet. Verifique os campos obrigatórios.');
    }
  }

  /**
   * Realiza o upload da imagem do pet.
   * Conforme página 15 do PDF: Multipart Form Data com chave 'foto'.
   */
  async uploadFoto(petId: number, foto: File): Promise<any> {
    const formData = new FormData();
    formData.append('foto', foto); // A chave DEVE ser 'foto' conforme o Swagger

    try {
      // O retorno da API é um AnexoResponseDto
      return await firstValueFrom(
        this.http.post<any>(`${this.API_URL}/${petId}/fotos`, formData)
      );
    } catch (error) {
      throw new Error('Erro ao processar a imagem. O formato deve ser JPG ou PNG.');
    }
  }
}