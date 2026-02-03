import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { PetService, Pet } from '../../../core/services/pet.service';

@Component({
  selector: 'app-pet-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.css'],
})
export class PetListComponent implements OnInit {
  public petService = inject(PetService);
  private router = inject(Router);

  listaDePets = signal<Pet[]>([]); 
  currentPage = signal(0);
  totalPages = signal(0);

  filtroNome = ''; 
  filtroRaca = ''; 

  async ngOnInit() {
    await this.buscar();
  }

  async buscar(page: number = 0) {
    try {
      // AJUSTES: 
      // 1. Mudamos de 8 para 10 itens por página.
      // 2. Adicionamos o parâmetro de ordenação 'id,desc' (mais recente primeiro).
      // Nota: Verifique se seu PetService aceita o parâmetro de ordenação.
      const res = await this.petService.carregarPets(
        this.filtroNome, 
        page, 
        10, // Tamanho da página corrigido para 10
        this.filtroRaca,
        'id,desc' // Ordenação por ID decrescente (ordem de cadastro)
      );
      
      this.listaDePets.set(res.content || []);

      const r = res as any; 

      const paginaRetornada = r.page !== undefined ? r.page : (r.number ?? page);
      this.currentPage.set(paginaRetornada);

      const total = r.pageCount ?? r.totalPages ?? 0;
      this.totalPages.set(total);
      
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  }

  async excluir(id: number) {
    if (confirm('Tem certeza que deseja excluir este pet do sistema?')) {
      try {
        await this.petService.deletePet(id);
        // Se a página atual ficar vazia após excluir, voltamos uma página
        const novaPagina = this.listaDePets().length === 1 && this.currentPage() > 0 
          ? this.currentPage() - 1 
          : this.currentPage();
          
        await this.buscar(novaPagina); 
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir o pet.');
      }
    }
  }

  navegarParaCadastro() {
    this.router.navigate(['/pets/novo']);
  }
}