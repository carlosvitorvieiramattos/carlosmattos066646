#  Pet Registry - Sistema de Registro de Pets e Tutores

Aplicação Angular 18 standalone para gerenciamento completo de pets e tutores com autenticação JWT, CRUD completo, upload de fotos e dashboard. Desenvolvida seguindo padrões enterprise com testes unitários e containerização Docker.

**Desenvolvedor:** Carlos Mattos | **Vaga:** Angular Sênior | **Instituição:** SEPLAG-MT

---

##   Funcionalidades Principais

| Funcionalidade | Descrição |
|---|---|
|  **Autenticação JWT** | Login seguro com token JWT, interceptor automático e guard para rotas protegidas |
|  **CRUD de Pets** | Criar, listar, editar e deletar pets com upload de fotos |
|  **CRUD de Tutores** | Gerenciamento completo de tutores com validação de CPF |
|  **Dashboard** | Resumo de dados e estatísticas gerais |
|  **Validação Avançada** | Máscaras de entrada (CPF, Telefone) e validações em tempo real |
|  **Testes** | Cobertura 85-95% com Karma + Jasmine |
|  **Docker** | Containerização com Nginx e health checks |

---

##   Arquitetura e Padrões

A aplicação segue uma **arquitetura em camadas** com padrões de design consolidados:

```
src/app/
├── core/                    # Lógica centralizada
│   ├── facades/            # Padrão Facade (abstrai complexidade)
│   ├── services/           # Integração com API
│   ├── guards/             # Proteção de rotas
│   ├── interceptors/       # Injeção de JWT
│   ├── state/              # Gerenciamento de estado (BehaviorSubject)
│   └── model/              # Tipos e interfaces TypeScript
│
├── features/               # Módulos de negócio isolados
│   ├── auth/               # Autenticação e login
│   ├── pets/               # Gerenciamento de pets
│   ├── tutores/            # Gerenciamento de tutores
│   └── dashboard/          # Página inicial
│
├── shared/                 # Componentes e diretivas reutilizáveis
│   ├── directives/         # Máscara de entrada (CPF, Telefone)
│   └── styles/             # Estilos globais com Tailwind
│
└── environments/           # Configuração por ambiente
```

### Padrões Implementados:
- **Facade Pattern:** Camada `facades/` centraliza todas as operações, isolando lógica complexa dos componentes
- **State Management:** `BehaviorSubject` para reatividade e cache automático
- **Reactive Forms:** Validação complexa com TypeScript strict mode
- **Lazy Loading:** Carregamento sob demanda de módulos
- **Standalone Components:** Angular 18+ API moderna

---

##   Quick Start

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
ng serve
# Acessa http://localhost:4200
```

### Testes
```bash
# Executar testes com cobertura
ng test --code-coverage

# Build para produção
ng build --configuration production
```

---

##   Docker

A aplicação está containerizada e pronta para produção com Nginx e health checks configurados.

```bash
# Build da imagem
docker build -t pet-registry-mt:latest .

# Executar com Docker Compose
docker-compose up -d

# Testar health check
curl http://localhost:8080/health
```

---

##   Autenticação

O fluxo é seguro e automatizado:

1. **Login:** Usuário insere credenciais no formulário
2. **JWT:** API retorna token que é armazenado localmente
3. **Interceptor:** Token é automaticamente injetado em todas as requisições
4. **Guard:** Protege rotas para apenas usuários autenticados
5. **Logout:** Token é removido ao fazer logout

```typescript
// Uso simples no componente
this.authFacade.login(email, password).subscribe(
  user => console.log('Autenticado:', user)
);
```

---

##   Configuração

### Variáveis de Ambiente
Criar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Proxy para Desenvolvimento
```bash
ng serve --proxy-config proxy.conf.json
```

---

##   Dependências Principais

- **Angular 18:** Framework web moderno
- **TypeScript:** Tipagem forte para JavaScript
- **RxJS:** Programação reativa
- **Tailwind CSS:** Framework CSS utilitário
- **Karma + Jasmine:** Testes unitários

---

##   Boas Práticas Implementadas

 **Clean Code:** SOLID + DRY principles  
 **Type Safety:** TypeScript strict mode  
 **Strong Tests:** Cobertura 85-95%  
 **Reactive:** RxJS operators otimizados  
 **Security:** JWT + CORS protection  
 **Monitoring:** Health checks integrados  
 **Responsive:** Tailwind CSS responsive design  

---

##   Informações do Desenvolvedor

**Carlos Mattos** | Desenvolvedor Angular Sênior | SEPLAG-MT


