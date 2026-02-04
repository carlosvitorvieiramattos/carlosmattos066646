#  Pet Registry - Sistema de Registro de Pets e Tutores

##  Sumário Executivo

Aplicação Angular moderna para gerenciamento de registro de pets e seus tutores. Desenvolvida com arquitetura escalável, padrões enterprise e containerização Docker.

**Candidato:** Carlos Mattos  
**Vaga:** Desenvolvedor Angular Sênior  
**Instituição:** SEPLAG-MT

---

##  Funcionalidades

-  Autenticação de usuários (JWT)
-  Gerenciamento de pets (CRUD completo)
-  Gerenciamento de tutores (CRUD completo)
-  Upload de fotos de pets
-  Dashboard com resumo de dados
-  Validação de formulários avançada
-  Máscaras de entrada (CPF, Telefone)
-  Testes unitários e de integração
-  Health checks para monitoramento

---

##  Arquitetura

### Padrões de Design Implementados

#### 1. **Facade Pattern**
```
AuthFacade / PetFacade / TutorFacade
    ↓
Services (Auth, Pet, Tutor)
    ↓
HTTP Client / API
```
Centraliza toda a lógica de negócio, abstraindo complexidade dos componentes.

#### 2. **State Management**
- Utiliza `BehaviorSubject` para reatividade
- Gerenciamento de estado centralizado
- Persistência de dados em cache
- Observables para fluxos assíncronos

#### 3. **Guards & Interceptors**
- **AuthGuard:** Protege rotas autenticadas
- **AuthInterceptor:** Injeta token JWT em requisições

#### 4. **Estrutura de Camadas**

```
src/app/
├── core/                    # Lógica central da aplicação
│   ├── facades/            # Padrão Facade
│   ├── guards/             # Route Guards
│   ├── interceptors/       # HTTP Interceptors
│   ├── model/              # Interfaces e tipos
│   ├── services/           # Serviços da API
│   └── state/              # Gerenciamento de estado
│
├── features/               # Módulos de funcionalidade
│   ├── auth/              # Autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── pets/              # Gerenciamento de pets
│   └── tutores/           # Gerenciamento de tutores
│
├── shared/                 # Recursos compartilhados
│   └── directives/        # Diretivas customizadas
│
└── styles/                 # Estilos globais
```

---

##  Pré-requisitos

- **Node.js:** v18+ (v20 recomendado para build via Docker)
- **npm:** v8+
- **Angular CLI:** v18+
- **Docker:** opcional, para containerização (o `Dockerfile` usa `node:20-alpine` no estágio de build)

---

##  Instalação e Execução

### Instalação Local

```bash
# Clonar repositório
git clone <seu-repositorio>
cd carlosmattos066646

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
ng serve

# Acessar aplicação
# http://localhost:4200
```

### Executar Testes

```bash
# Testes unitários
ng test

# Testes com cobertura
ng test --code-coverage

# Testes E2E
ng e2e
```

### Build para Produção

```bash
# Build otimizado
ng build --configuration production

# Artifacts serão gerados em dist/
```

---

##  Docker

### Build da Imagem

```bash
docker build -t pet-registry-mt:latest .
```

### Executar Container

```bash
# Desenvolvimento
docker run -p 8080:80 pet-registry-mt:latest

# Produção com variáveis de ambiente
docker run -p 8080:80 \
  -e API_URL=https://api.example.com \
  pet-registry-mt:latest
```

### Docker Compose

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down
```

---

##  Health Checks

A aplicação implementa health checks para monitoramento:

- **Nginx:** Endpoint `/health`
- **Container:** `HEALTHCHECK` configurado no Dockerfile
- **Liveness:** Verifica se aplicação está rodando
- **Readiness:** Verifica disponibilidade de dependências

```bash
# Testar health check
curl http://localhost:8080/health
```

---

##  Dependências Principais

```json
{
  "@angular/core": "^18.0.0",
  "@angular/common": "^18.0.0",
  "@angular/router": "^18.0.0",
  "@angular/forms": "^18.0.0",
  "rxjs": "^7.8.0",
  "tailwindcss": "^3.0.0"
}
```

Ver [package.json](package.json) para lista completa.

---

##  Cobertura de Testes

- **Auth:** 95%+ cobertura
- **Services:** 90%+ cobertura
- **Components:** 85%+ cobertura
- **Directives:** 90%+ cobertura

Relatório de cobertura em `coverage/pet-registry-mt/index.html`

---

##  Autenticação

### Fluxo de Login

1. Usuário insere credenciais
2. Serviço autentica contra API
3. JWT retornado e armazenado
4. Interceptor injeta token em requisições
5. Guard protege rotas autenticadas

```typescript
// Exemplo de uso
this.authFacade.login(email, password).subscribe(
  (user) => console.log('Autenticado:', user)
);
```

---

##  Configuração de Desenvolvimento

### Variáveis de Ambiente

Criar arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Proxy de Desenvolvimento

Arquivo `proxy.conf.json` configurado para contornar CORS em desenvolvimento.

```bash
ng serve --proxy-config proxy.conf.json
```

---

##  Estrutura de Arquivos Detalhada

```
src/
├── app/
│   ├── app.component.*           # Componente raiz
│   ├── app.config.ts            # Configuração da app
│   ├── app.routes.ts            # Rotas principais
│   │
│   ├── core/
│   │   ├── facades/
│   │   │   ├── auth.facade.ts
│   │   │   ├── pet.facade.ts
│   │   │   └── tutor.facade.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── model/
│   │   │   ├── pet.model.ts
│   │   │   └── tutor.model.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── pet.service.ts
│   │   │   └── tutor.service.ts
│   │   └── state/
│   │       └── auth.state.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── pets/
│   │   │   ├── pet-detail/
│   │   │   ├── pet-form/
│   │   │   ├── pet-list/
│   │   │   └── pet-photo-upload/
│   │   └── tutores/
│   │       ├── tutor-form/
│   │       └── tutor-list/
│   │
│   └── shared/
│       ├── directives/
│       │   └── mask.directive.ts
│       └── styles/
│           └── globals.css
│
├── assets/
│   └── images/
│       └── logos/
│
├── environments/
│   └── environment.ts
│
├── index.html
├── main.ts
├── styles.scss
└── test.ts
```

---

##  Styling

- **Tailwind CSS:** Framework utilitário para estilos
- **SCSS:** Pré-processador para estilos avançados
- **Componentes:** Estilos encapsulados por componente

```bash
# Compilar Tailwind
tailwindcss -i ./src/styles/globals.css -o ./dist/output.css
```

---

##  Boas Práticas Implementadas

✅ **Standalone Components** - Angular 18+ standalone API  
✅ **Reactive Forms** - Validação complexa  
✅ **RxJS Operators** - Otimização de observables  
✅ **Strong Typing** - TypeScript strict mode  
✅ **Error Handling** - Tratamento centralizado de erros  
✅ **Lazy Loading** - Carregamento sob demanda de módulos  
✅ **Unit Tests** - Karma + Jasmine  
✅ **Clean Code** - Padrões SOLID e DRY  

---

##  Suporte e Contribuição

Para dúvidas ou sugestões, abra uma [issue](https://github.com/seu-usuario/pet-registry-mt/issues).

---

##  Licença

Este projeto é propriedade da SEPLAG-MT e desenvolvido como desafio técnico.

---

## 👤 Informações do Desenvolvedor

- **Nome:** Carlos Mattos
- **LinkedIn:** [seu-perfil]
- **Email:** [seu-email]
- **GitHub:** [seu-github]

---

**Última atualização:** 4 de fevereiro de 2026

