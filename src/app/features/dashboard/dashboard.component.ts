import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PetService } from '../../core/services/pet.service';
import { TutorService } from '../../core/services/tutor.service';
import { interval, Subscription } from 'rxjs';

interface Atividade {
  id: number | string;
  descricao: string;
  usuarioNome: string;
  dataHora: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private petService = inject(PetService);
  private tutorService = inject(TutorService);
  private timerSubscription?: Subscription;

  loading = signal(true);
  totalPets = signal(0);
  totalTutores = signal(0);
  today: Date = new Date();
  atividadesRecentes = signal<Atividade[]>([]);

  async ngOnInit() {
    await this.carregarDadosDashboard();

    // Atualização em tempo real a cada 60 segundos
    this.timerSubscription = interval(60000).subscribe(() => {
      this.carregarDadosDashboard(false); 
    });
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  async carregarDadosDashboard(mostrarLoading = true) {
    if (mostrarLoading) this.loading.set(true);
    
    try {
      // AJUSTE: Para "puxar todos", aumentamos o 'size' (ex: 999) 
      // ou usamos o totalElements da resposta anterior.
      const [resPets, resTutores] = await Promise.all([
        this.petService.carregarPets('', 0, 999, '', 'id,desc'), 
        this.tutorService.carregarTutores('', 0, 999) 
      ]);

      // 1. Atualiza os contadores globais (independente do size)
      this.totalPets.set(this.extrairTotal(resPets));
      this.totalTutores.set(this.extrairTotal(resTutores));

      // 2. Mapeia TODOS os pets recebidos para a lista da tabela
      const listaTodosPets = resPets?.content || [];
      const atividades: Atividade[] = listaTodosPets.map((pet: any) => ({
        id: pet.id,
        descricao: `Animal identificado: ${pet.nome}`,
        usuarioNome: pet.raca || 'Raça não informada',
        dataHora: new Date() 
      })).sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime()).slice(0, 5);

      this.atividadesRecentes.set(atividades);
      this.today = new Date();

    } catch (error) {
      console.error('Erro ao processar dados do dashboard:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private extrairTotal(res: any): number {
    if (!res) return 0;
    if (typeof res.totalElements === 'number') return res.totalElements;
    if (Array.isArray(res)) return res.length;
    if (res.content && Array.isArray(res.content)) return res.totalElements || res.content.length;
    return 0;
  }
}