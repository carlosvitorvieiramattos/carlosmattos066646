import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TutorFacade } from '../../../core/facades/tutor.facade';
import { Tutor } from '../../../core/model/tutor.model';

@Component({
  selector: 'app-tutor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tutor-list.component.html'
})
export class TutorListComponent implements OnInit {
  // --- INJEÇÕES ---
  // PetService removido pois não há mais vínculo nesta tela
  public tutorFacade = inject(TutorFacade);

  // --- UTILITÁRIOS ---
  protected readonly Math = Math;

  // --- ESTADOS (Signals) ---
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  
  // Controle de Paginação
  paginaAtual = signal<number>(0);
  readonly itensPorPagina = 10; 

  // --- LÓGICA REATIVA (Computed) ---
  
  /**
   * Calcula o total de páginas reativamente.
   */
  totalPaginas = computed(() => {
    const total = this.tutorFacade.totalElementos();
    return total > 0 ? Math.ceil(total / this.itensPorPagina) : 1;
  });

  // Lista que observa a Facade
  tutoresFiltrados = computed(() => this.tutorFacade.listaTutores());

  async ngOnInit() {
    await this.carregarDados();
  }

  // --- MÉTODOS DE AÇÃO ---

  async carregarDados() {
    this.isLoading.set(true);
    try {
      // A Facade gerencia o estado global da lista e do total de elementos
      await this.tutorFacade.buscarTutores(
        this.searchTerm(), 
        this.paginaAtual(), 
        this.itensPorPagina
      );
    } catch (error) {
      console.error('Erro ao carregar tutores:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async mudarPagina(novaPagina: number) {
    if (novaPagina >= 0 && novaPagina < this.totalPaginas()) {
      this.paginaAtual.set(novaPagina);
      await this.carregarDados();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Otimização: Debounce (Opcional)
   * Para evitar chamadas excessivas à API a cada tecla digitada.
   */
  filtrar(event: Event) {
    const elemento = event.target as HTMLInputElement;
    this.searchTerm.set(elemento.value);
    this.paginaAtual.set(0); 
    this.carregarDados();
  }

  async confirmarExclusao(tutor: Tutor) {
    if (!tutor.id || !confirm(`Excluir o tutor ${tutor.nome}?`)) return;
    
    this.isLoading.set(true);
    try {
      await this.tutorFacade.excluirTutor(tutor.id);
      
      // Lógica inteligente de paginação após exclusão
      if (this.tutoresFiltrados().length <= 1 && this.paginaAtual() > 0) {
        this.paginaAtual.update(p => p - 1);
      }
      
      await this.carregarDados();
    } catch (e) {
      alert('Erro ao excluir tutor.');
    } finally {
      this.isLoading.set(false);
    }
  }
}