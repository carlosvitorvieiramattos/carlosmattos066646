import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetService } from '../../../core/services/pet.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.css']
})
export class PetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  isLoading = signal(false);
  isEditMode = signal(false);
  petId = signal<number | null>(null);
  
  fotoPreviewSafe = signal<SafeUrl | null>(null);
  arquivoSelecionado = signal<File | null>(null);

  // Definição do Formulário Reativo
  petForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    raca: ['', [Validators.required, Validators.maxLength(100)]],
    idade: [null, [Validators.required, Validators.min(0)]]
  });

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    // Verificação robusta do ID na rota
    if (idParam && !isNaN(Number(idParam))) {
      const id = Number(idParam);
      this.isEditMode.set(true);
      this.petId.set(id);
      await this.carregarDadosParaEdicao(id);
    }
  }

  async carregarDadosParaEdicao(id: number) {
    this.isLoading.set(true);
    try {
      const pet = await this.petService.getPetById(id);
      
      this.petForm.patchValue({
        nome: pet.nome,
        raca: pet.raca,
        idade: pet.idade
      });
      
      // Validação segura da propriedade foto
      if (pet?.foto?.url) {
        this.fotoPreviewSafe.set(this.sanitizer.bypassSecurityTrustUrl(pet.foto.url));
      }
    } catch (error) {
      console.error('Erro ao carregar pet:', error);
      alert('Não foi possível carregar os dados do pet.');
      this.cancelar();
    } finally {
      this.isLoading.set(false);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0]; // Operador de navegação segura

    if (file) {
      // Opcional: Validar tamanho do arquivo (ex: 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo é muito grande! Selecione uma imagem de até 2MB.');
        return;
      }

      this.arquivoSelecionado.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Sanitiza a string base64 para o preview
        this.fotoPreviewSafe.set(this.sanitizer.bypassSecurityTrustUrl(base64String));
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    // Se o formulário estiver inválido, marca os campos para mostrar os erros no HTML
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    try {
      const dadosForm = this.petForm.getRawValue();
      let petIdFinal: number;

      if (this.isEditMode() && this.petId()) {
        const id = this.petId()!;
        await this.petService.updatePet(id, dadosForm);
        petIdFinal = id;
      } else {
        const novoPet = await this.petService.addPet(dadosForm);
        petIdFinal = novoPet.id;
      }

      // Upload da foto só ocorre se um arquivo novo foi selecionado
      const arquivo = this.arquivoSelecionado();
      if (arquivo) {
        await this.petService.uploadFoto(petIdFinal, arquivo);
      }

      this.router.navigate(['/pets']);
    } catch (error) {
      console.error('Erro na operação:', error);
      alert('Erro ao salvar os dados. Verifique sua conexão.');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelar() {
    this.router.navigate(['/pets']);
  }
}