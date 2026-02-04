import { Routes as NgRoutes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: NgRoutes = [
  { 
    path: 'login', 
    title: 'Pet-MT - Login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: '',
    
    canActivate: [authGuard], 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        title: 'Pet-MT - Dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      {
        path: 'pets',
        children: [
          { 
            path: '', 
            title: 'Pet-MT - Listagem de Animais',
            loadComponent: () => import('./features/pets/pet-list/pet-list.component').then(m => m.PetListComponent) 
          },
          { 
            path: 'novo', 
            title: 'Pet-MT - Novo Animal',
            loadComponent: () => import('./features/pets/pet-form/pet-form.component').then(m => m.PetFormComponent) 
          },
          { 
            path: 'editar/:id', 
            title: 'Pet-MT - Editar Animal',
            loadComponent: () => import('./features/pets/pet-form/pet-form.component').then(m => m.PetFormComponent) 
          },
          { 
            path: ':id', 
            title: 'Pet-MT - Detalhes do Animal',
            loadComponent: () => import('./features/pets/pet-detail/pet-detail.component').then(m => m.PetDetailComponent) 
          }
        ]
      },
      {
        path: 'tutores',
        children: [
          { 
            path: '', 
            title: 'Pet-MT - Listagem de Tutores',
            loadComponent: () => import('./features/tutores/tutor-list/tutor-list.component').then(m => m.TutorListComponent) 
          },
          { 
            path: 'novo', 
            title: 'Pet-MT - Novo Tutor',
            loadComponent: () => import('./features/tutores/tutor-form/tutor-form.component').then(m => m.TutorFormComponent) 
          },
          { 
            path: 'editar/:id', 
            title: 'Pet-MT - Editar Tutor',
            loadComponent: () => import('./features/tutores/tutor-form/tutor-form.component').then(m => m.TutorFormComponent) 
          },
          { 
            path: ':id', 
            title: 'Pet-MT - Detalhes do Tutor',
            loadComponent: () => import('./features/tutores/tutor-detail/tutor-detail.component').then(m => m.TutorDetailComponent) 
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' } 
];