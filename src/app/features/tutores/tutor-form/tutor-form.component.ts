import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TutorService } from '../../../core/services/tutor.service';
import { PetService } from '../../../core/services/pet.service'; // Importado
import { MaskDirective } from '../../../shared/directives/mask.directive';

@Component({
  selector: 'app-tutor-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    MaskDirective
  ],
  templateUrl: './tutor-form.component.html'
})
export class TutorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public tutorService = inject(TutorService); 
  private petService = inject(PetService); // Injetado
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  tutorForm: FormGroup;
  salvando = signal(false);
  tutorId = signal<number | null>(null);
  tituloPagina = signal('Novo Tutor');
  
  // Signal para alimentar o @for no HTML
  petsDisponiveis = signal<any[]>([]);

  arquivoSelecionado = signal<File | null>(null);
  fotoPreviewSafe = signal<SafeUrl | null>(null);

  constructor() {
    this.tutorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.minLength(14)]], 
      endereco: ['', [Validators.required]],
      cpf: ['', [Validators.required, Validators.minLength(14)]],
      petIds: [[]] // Novo controle para o select multiple do HTML
    });
  }

  async ngOnInit() {
    // 1. Carrega a lista de pets primeiro para o select estar pronto
    await this.carregarPets();

    // 2. Verifica se é edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tutorId.set(Number(id));
      this.tituloPagina.set('Editar Tutor');
      await this.carregarDadosTutor(this.tutorId()!);
    }
  }

  private async carregarPets() {
    try {
      const res = await this.petService.carregarPets('', 0, 200);
      this.petsDisponiveis.set(res.content || []);
    } catch (error) {
      console.error('Erro ao carregar lista de pets:', error);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.arquivoSelecionado.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.fotoPreviewSafe.set(this.sanitizer.bypassSecurityTrustUrl(base64String));
      };
      reader.readAsDataURL(file);
    }
  }

  private async carregarDadosTutor(id: number) {
    try {
      const dados = await this.tutorService.getTutorById(id);
      
      if (dados.foto) {
        const url = typeof dados.foto === 'string' ? dados.foto : dados.foto.url;
        this.fotoPreviewSafe.set(this.sanitizer.bypassSecurityTrustUrl(url));
      }

      // Preenche o formulário. Se a API trouxer pets como objetos, mapeamos para IDs
      const petIds = dados.pets ? dados.pets.map((p: any) => p.id || p) : [];
      
      this.tutorForm.patchValue({
        ...dados,
        petIds: petIds
      });

    } catch (error) {
      console.error('Erro ao carregar tutor:', error);
      this.router.navigate(['/tutores']);
    }
  }

  async salvar() {
    if (this.tutorForm.invalid) {
      this.tutorForm.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    try {
      const formValues = this.tutorForm.getRawValue();
      
      const payload = {
        ...formValues,
        // Limpa a máscara do CPF
        cpf: Number(String(formValues.cpf).replace(/\D/g, '')),
        // A API costuma esperar uma lista de objetos ou IDs. 
        // Se a API pedir apenas IDs, petIds já está correto.
      };

      let tutorResult;
      if (this.tutorId()) {
        tutorResult = await this.tutorService.atualizarTutor(this.tutorId()!, payload);
      } else {
        tutorResult = await this.tutorService.addTutor(payload);
      }

      const idFinal = this.tutorId() || tutorResult?.id;
      const arquivoParaUpload = this.arquivoSelecionado();

      if (idFinal && arquivoParaUpload) {
        await this.tutorService.uploadFoto(idFinal, arquivoParaUpload);
      }
      
      this.router.navigate(['/tutores']);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar tutor. Verifique os dados ou o tamanho da imagem.');
    } finally {
      this.salvando.set(false);
    }
  }
}