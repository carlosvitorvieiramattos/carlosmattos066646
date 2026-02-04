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

### ⚙️ Configuração Mínima de Pré-requisitos

- **Docker:** v20.10+
- **Docker Compose:** v2.0+
- **Espaço em disco:** ~2GB
- **RAM disponível:** ~512MB

Verifique a instalação:
```bash
docker --version
docker-compose --version
```

### 🚀 Teste Rápido com Docker Compose (Recomendado)

A forma mais fácil e recomendada de testar o sistema:

```bash
# 1. Clone o repositório (se ainda não tiver)
git clone <seu-repositorio>
cd carlosmattos066646

# 2. Inicie os serviços
docker-compose up -d

# 3. Aguarde a construção (primeira vez leva ~2-3 minutos)
docker-compose logs -f app-pets

# 4. Acesse a aplicação
# Abra seu navegador: http://localhost:8080
```

**Pronto!** A aplicação estará disponível em `http://localhost:8080`

#### Parar os Serviços

```bash
# Parar sem remover containers
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar, remover containers e volumes
docker-compose down -v
```

#### Visualizar Logs

```bash
# Logs em tempo real
docker-compose logs -f app-pets

# Últimas 100 linhas
docker-compose logs --tail=100 app-pets

# Logs sem timestamp
docker-compose logs --no-log-prefix app-pets
```

---

### 🔨 Build Manual da Imagem Docker

Se preferir construir e executar manualmente:

```bash
# 1. Build da imagem
docker build -t pet-registry-mt:latest .

# 2. Executar o container
docker run -d \
  --name pets-app \
  -p 8080:80 \
  --restart always \
  pet-registry-mt:latest

# 3. Acessar
# http://localhost:8080
```

#### Gerenciar Container Manual

```bash
# Ver containers rodando
docker ps

# Parar container
docker stop pets-app

# Iniciar container parado
docker start pets-app

# Ver logs
docker logs -f pets-app

# Remover container
docker rm pets-app
```

---

### ✅ Verificando a Saúde da Aplicação

#### Health Check via Terminal

```bash
# Testar endpoint de saúde
curl http://localhost:8080/health

# Resposta esperada: Status 200
```

#### Health Check no Docker

```bash
# Ver status de saúde do container
docker ps --format "table {{.Names}}\t{{.Status}}"

# Exemplo de saída:
# pets-front    Up 2 minutes (healthy)
```

#### Logs de Healthcheck

```bash
# Ver se healthcheck está funcionando
docker inspect pets-front | grep -A 5 "Health"
```

---

### 🧪 Como Testar o Sistema

#### 1️⃣ **Acessar a Aplicação**

```
URL: http://localhost:8080
```

#### 2️⃣ **Testar Autenticação**

- Navegue até a tela de **Login**
- Insira credenciais de teste
- Verifique se o **token JWT** é armazenado
- Observe o **redirecionamento para Dashboard**

#### 3️⃣ **Testar Gerenciamento de Tutores**

- Clique em **Tutores**
- Teste **Adicionar novo tutor**
  - Preencha nome, CPF, telefone
  - Observe as **máscaras de entrada**
  - Valide os campos
- Teste **Editar tutor**
- Teste **Deletar tutor** com confirmação
- Busque por CPF ou nome

#### 4️⃣ **Testar Gerenciamento de Pets**

- Clique em **Pets**
- Teste **Adicionar novo pet**
  - Selecione um tutor
  - Insira nome, raça, data de nascimento
  - Envie a requisição
- Teste **Upload de foto**
  - Clique em um pet
  - Upload de imagem em formato JPG/PNG
  - Verifique visualização
- Teste **Editar pet**
- Teste **Deletar pet**

#### 5️⃣ **Testar Dashboard**

- Visualize **resumo de dados**:
  - Total de tutores
  - Total de pets
  - Últimos registros
- Verifique **atualização em tempo real**

#### 6️⃣ **Testar Validações**

Tente enviar formulários com dados inválidos:
- CPF inválido
- Telefone incompleto
- Campos vazios
- Emails malformados

Observe as **mensagens de erro apropriadas**

---

### 📊 Monitoramento Durante Testes

#### Visualizar Performance do Container

```bash
# Uso de CPU e memória
docker stats pets-front

# Exemplo de saída:
# CONTAINER     CPU %    MEM USAGE / LIMIT
# pets-front    0.05%    45.2MiB / 256MiB
```

#### Acessar Logs de Build

```bash
# Se houver erro no build
docker-compose logs app-pets
```

#### Debug: Entrar no Container

```bash
# Acessar shell do container
docker exec -it pets-front /bin/sh

# Ver arquivos da aplicação
ls -la /usr/share/nginx/html

# Verificar configuração Nginx
cat /etc/nginx/conf.d/default.conf

# Sair do container
exit
```

---

### 🔄 Reconstruir Imagem (Após Mudanças)

Se fez alterações no código e quer testar:

```bash
# Opção 1: Com Docker Compose
docker-compose down
docker-compose up --build -d

# Opção 2: Build Manual
docker build --no-cache -t pet-registry-mt:latest .
docker stop pets-app 2>/dev/null || true
docker rm pets-app 2>/dev/null || true
docker run -d \
  --name pets-app \
  -p 8080:80 \
  pet-registry-mt:latest
```

---

### 🐛 Troubleshooting

#### Porta 8080 já está em uso

```bash
# Encontrar processo usando a porta
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Mac/Linux

# Usar outra porta
docker run -p 8081:80 pet-registry-mt:latest
# Acessar: http://localhost:8081
```

#### Container para com erro

```bash
# Ver detalhes do erro
docker logs pets-front -n 50

# Reiniciar container
docker restart pets-front
```

#### Aplicação lenta ou não carrega

```bash
# Verificar saúde
docker ps --format "table {{.Names}}\t{{.Status}}"

# Se não estiver healthy, reiniciar
docker restart pets-front

# Aguarde ~30 segundos e recarregue o navegador
```

#### Cache/Cookies causando problemas

```bash
# Limpar cache do navegador (Ctrl+Shift+Delete em Chrome/Firefox)
# Ou acessar em modo anônimo

# Limpar container completamente
docker-compose down -v
docker-compose up -d
```

---

### 📁 Estrutura Docker

```
.
├── Dockerfile              # Definição da imagem
├── docker-compose.yml      # Orquestração de serviços
├── nginx.conf             # Configuração do servidor web
└── src/                   # Código fonte Angular
```

**Dockerfile usa Multi-stage Build:**
1. **Build Stage:** Compila aplicação Angular com Node 20
2. **Production Stage:** Executa com Nginx otimizado

---

### 📈 Recursos Alocados

```yaml
CPU:    0.50 (máximo), 0.10 (reservado)
Memória: 256MB (máximo), 64MB (reservado)
```

Ajuste em `docker-compose.yml` se necessário:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'        # Aumentar CPU
      memory: 512M       # Aumentar RAM
```

---

### ✨ Dicas Importantes

1. **Primeira Execução:** Pode levar 2-3 minutos para completar o build
2. **Recarregue o Navegador:** Se vir tela em branco, aguarde alguns segundos
3. **Limpe Cache:** Pressione F5 ou Ctrl+R para atualizar
4. **Modo Offline:** Verifique conexão com a API backend
5. **Desenvolvimento:** Use `ng serve` localmente (mais rápido)
6. **Produção:** Use Docker Compose (mais confiável)

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

 **Standalone Components** - Angular 18+ standalone API  
 **Reactive Forms** - Validação complexa  
 **RxJS Operators** - Otimização de observables  
 **Strong Typing** - TypeScript strict mode  
 **Error Handling** - Tratamento centralizado de erros  
 **Lazy Loading** - Carregamento sob demanda de módulos  
 **Unit Tests** - Karma + Jasmine  
 **Clean Code** - Padrões SOLID e DRY  

---

##  Suporte e Contribuição

Para dúvidas ou sugestões, abra uma [issue](https://github.com/seu-usuario/pet-registry-mt/issues).

---

##  Licença

Este projeto é propriedade da SEPLAG-MT e desenvolvido como desafio técnico.

---

## 👤 Informações do Desenvolvedor

- **Nome:** Carlos Vitor Vieira Mattos


---

**Última atualização:** 4 de fevereiro de 2026

