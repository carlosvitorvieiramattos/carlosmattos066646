import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TutorService, Tutor } from '../../../core/services/tutor.service';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tutor-detail.component.html',
  styleUrls: ['./tutor-detail.component.css']
})
export class TutorDetailComponent implements OnInit {
  private tutorService = inject(TutorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tutor = signal<Tutor | null>(null);
  carregando = signal(true);
  erro = signal<string | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.carregarTutor(Number(id));
    } else {
      this.erro.set('ID do tutor não encontrado');
      this.carregando.set(false);
    }
  }

  private async carregarTutor(id: number) {
    try {
      this.carregando.set(true);
      const dados = await this.tutorService.getTutorById(id);
      
      // Ajuste para garantir que o CPF seja tratado como string se o modelo exigir
      // e o serviço retornar number
      this.tutor.set(dados);
      this.erro.set(null);
    } catch (error) {
      console.error('Erro ao carregar tutor:', error);
      this.erro.set('Erro ao carregar detalhes do tutor');
    } finally {
      this.carregando.set(false);
    }
  }

  voltar() {
    this.router.navigate(['/tutores']);
  }

  editar(id: number | undefined) {
    if (id) {
      this.router.navigate(['/tutores/editar', id]);
    }
  }

  async confirmarExclusao() {
    const id = this.tutor()?.id;
    if (!id) return;
    
    if (confirm(`Tem certeza que deseja excluir o tutor ${this.tutor()?.nome}?`)) {
      try {
        // CORREÇÃO: Usando o nome correto do método que está no seu serviço
        await this.tutorService.excluirTutor(id);
        alert('Tutor excluído com sucesso!');
        this.voltar();
      } catch (error) {
        console.error('Erro ao excluir tutor:', error);
        alert('Erro ao excluir tutor');
      }
    }
  }
}