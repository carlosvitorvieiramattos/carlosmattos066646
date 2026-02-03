// 1. CORREÇÃO DOS IMPORTS: Tudo que é estrutural vem do @angular/core
import { Component, inject, OnInit, signal, computed, Input } from '@angular/core'; 
import { CommonModule } from '@angular/common'; // CommonModule continua aqui (para Pipes, etc)
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Importação dos serviços e componentes locais
import { PetService, Pet } from '../../../core/services/pet.service';
import { TutorService, Tutor } from '../../../core/services/tutor.service';
import { PetPhotoUploadComponent } from '../pet-photo-upload/pet-photo-upload.component';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PetPhotoUploadComponent, FormsModule],
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.css']
})
export class PetDetailComponent implements OnInit {
  private petService = inject(PetService);
  private tutorService = inject(TutorService);

  @Input({ required: true }) set id(petId: string) {
    if (petId) {
      const idNumerico = Number(petId);
      if (!isNaN(idNumerico)) this.carregarDados(idNumerico);
    }
  }

  pet = signal<Pet | null>(null);
  carregando = signal(true);
  exibirModalTutores = signal(false);
  listaTutores = signal<Tutor[]>([]);
  filtroTutor = signal('');

  // 2. CORREÇÃO DO ERRO 'any': Tipagem explícita nos parâmetros (t: Tutor)
  tutoresFiltrados = computed(() => {
    const termo = this.filtroTutor().toLowerCase().trim();
    const lista = this.listaTutores(); 
    
    if (!termo) return lista;

    return lista.filter((t: Tutor) => { // Tipado como Tutor
      const nomeMatch = t.nome?.toLowerCase().includes(termo) ?? false;
      const emailMatch = t.email?.toLowerCase().includes(termo) ?? false;
      const cpfString = t.cpf != null ? String(t.cpf) : '';
      
      return nomeMatch || emailMatch || cpfString.includes(termo);
    });
  });

  ngOnInit() {}

  async carregarDados(id: number) {
    this.carregando.set(true);
    try {
      const dados = await this.petService.getPetById(id); 
      this.pet.set(dados);
    } catch (error) {
      console.error('Falha ao obter dados:', error);
    } finally {
      this.carregando.set(false);
    }
  }

  async abrirModalVincular() {
    this.exibirModalTutores.set(true);
    try {
      const res = await this.tutorService.carregarTutores('', 0, 100);
      
      // Tipagem explícita para evitar o erro de 'any' nos loops
      const idsJaVinculados = new Set(this.pet()?.tutores?.map((t: Tutor) => t.id) || []);
      
      const disponiveis = (res.content || []).filter((t: Tutor) => !idsJaVinculados.has(t.id));
      this.listaTutores.set(disponiveis);
    } catch (error) {
      console.error('Erro ao listar tutores:', error);
    }
  }

  async selecionarTutor(tutorId: number | undefined) { 
    const petId = this.pet()?.id;
    if (!petId || !tutorId) return; 

    try {
      await this.tutorService.vincularPet(tutorId, petId);
      this.fecharModal();
      await this.carregarDados(petId); 
    } catch (error) {
      alert('Erro ao realizar vínculo.');
    }
  }

  async desvincularTutor(tutorId: number | undefined) {
    const petId = this.pet()?.id;
    if (!petId || !tutorId) return;
    
    if (!confirm('Remover este tutor?')) return;

    try {
      await this.tutorService.desvincularPet(tutorId, petId);
      await this.carregarDados(petId);
    } catch (error) {
      alert('Erro ao desvincular.');
    }
  }

  fecharModal() {
    this.exibirModalTutores.set(false);
    this.filtroTutor.set('');
  }

  onFotoAtualizada() {
    const id = this.pet()?.id;
    if (id) this.carregarDados(id);
  }
}