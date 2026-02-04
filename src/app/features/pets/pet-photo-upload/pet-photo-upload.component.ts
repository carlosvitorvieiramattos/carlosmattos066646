import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetService } from '../../../core/services/pet.service';

@Component({
  selector: 'app-pet-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-4 p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center bg-slate-50 transition-all hover:bg-slate-100">
      
      <div *ngIf="previewUrl()" class="mb-4 flex flex-col items-center animate-in zoom-in duration-300">
        <img [src]="previewUrl()" class="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg mb-2">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pré-visualização</span>
      </div>

      <input type="file" (change)="onFileSelected($event)" class="hidden" #fileInput accept="image/*">
      
      <div class="flex gap-2 justify-center">
        <button 
          (click)="fileInput.click()" 
          [disabled]="enviando()"
          class="px-4 py-2 bg-white text-slate-600 rounded-xl font-black text-xs shadow-sm border border-slate-100 hover:shadow-md disabled:opacity-50 transition-all">
          {{ previewUrl() ? 'TROCAR FOTO' : 'SELECIONAR FOTO' }}
        </button>

        <button 
          *ngIf="previewUrl()"
          (click)="confirmarUpload()" 
          [disabled]="enviando()"
          class="px-4 py-2 bg-orange-500 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50 transition-all">
          {{ enviando() ? 'ENVIANDO...' : 'CONFIRMAR ENVIO' }}
        </button>
      </div>
    </div>
  `
})
export class PetPhotoUploadComponent {
  private petService = inject(PetService);
  
  @Input({ required: true }) petId!: number; 
  @Output() uploadSuccess = new EventEmitter<void>();

  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  enviando = signal(false);

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async confirmarUpload() {
    const file = this.selectedFile();
    if (file && this.petId) {
      this.enviando.set(true);
      try {
        await this.petService.uploadFoto(this.petId, file);
        this.uploadSuccess.emit();
        this.limparSelecao();
      } catch (error) {
        console.error('Erro no upload:', error);
        alert('Erro ao sincronizar foto com o prontuário.');
      } finally {
        this.enviando.set(false);
      }
    }
  }

  private limparSelecao() {
    this.previewUrl.set(null);
    this.selectedFile.set(null);
  }
}