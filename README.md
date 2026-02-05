# Desafio Técnico SEPLAG-MT | Desenvolvedor Sênior


##  Dados do Candidato
- **Nome:** Carlos Vitor Vieira Mattos
- **Incrição:** 16463
- **Vaga:** Desenvolvedor Angular Sênior
- **Projeto:** Sistema de Registro Público de Pets e Tutores
---
##  Funcionalidades
-  Autenticação de usuários (JWT)
-  Gerenciamento de pets (CRUD completo)
-  Gerenciamento de tutores (CRUD completo)
-  Upload de fotos de pets
-  Dashboard com resumo de dados
-  Validação de formulários avançada
-  Máscaras de entrada (CPF, Telefone,e-mail)
-  Testes unitários e de integração
-  Health checks para monitoramento
---
##  Tecnologias Utilizadas


O projeto foi desenvolvido com as seguintes tecnologias:
* **Framework:** [Angular](https://angular.io/) (v14+)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) & SCSS
* **Infraestrutura:** [Docker](https://www.docker.com/) & [Nginx](https://www.nginx.com/)
* **Ícones:** [Bootstrap Icons](https://icons.getbootstrap.com/)
* **Testes:** [Karma](https://karma-runner.github.io/) & [Jasmine](https://jasmine.github.io/) — Ferramentas configuradas para execução de testes unitários (visto no arquivo `karma.conf.js`).
---
# Como Executar o Sistema


Siga os passos abaixo para configurar e rodar a aplicação localmente:


## 1. Pré-requisitos


Certifique-se de que você possui o **Git** instalado:
* [Download Git](https://git-scm.com/downloads)


Após a instalação, confirme que o Git está instalado, no seu terminal execute:
```bash
git --version


```
Certifique-se de que você possui o *Docker Descktop* instalado:
* [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
```bash
docker --version
docker ps
```
Se este comando retornar um erro de "pipe" ou "connection refused", o Docker Desktop ainda não terminou de inicializar.


### ATENÇÃO: Pare todos os containers que estiverem executando
```bash
docker rm -f $(docker ps -aq)
```
Remoção de qualquer vetigio para não ocorrer erro durante a inicialização do Docker




## 2. Clonar o Projeto


Clone o repositório no seu ambiente local, em um diretório abra o seu terminal e execute:
```bash
git clone https://github.com/carlosvitorvieiramattos/carlosmattos066646.git
```
Acesse a pasta do repositório
```bash
cd carlosmattos066646
```
### Inicie os serviços
```bash
docker-compose up -d
```
### Aguarde a construção (primeira vez leva ~2-3 minutos)
```bash
docker-compose logs -f app-pets
```
### Acesse a aplicação (Abra seu Navegador)
```bash
http://localhost:8080

Senha do login do sistema
"username: admin"  
"password: admin"
```
## 3. Inicialização via Docker
Limpa containers, imagens e volumes antigos do projeto
```bash
docker-compose down --rmi all --volumes --remove-orphans
```
Build e inicialização do container
```bash
docker-compose up -d --build
```
## 4. Acesso
Abra o seu navegador e acesse o link gerado pelo Docker:
http://localhost:8080
```bash
Senha do login do sistema
"username: admin"  
"password: admin"
```
Estrutura detalhada :
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


│   │       ├── tutor-detail/


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
## Como Testar o Sistema






#### 1 **Acessar a Aplicação**






```bash


URL: http://localhost:8080


Senha do login do sistema
"username: admin"  
"password: admin"


```






#### 2️ **Testar Autenticação**






- Navegue até a tela de **Login**


- Insira credenciais de teste


- Verifique se o **token JWT** é armazenado


- Observe o **redirecionamento para Dashboard**






#### 3️ **Testar Gerenciamento de Tutores**






- Clique em **Tutores**


- Teste **Adicionar novo tutor**


  - Preencha nome, CPF, telefone


  - Observe as **máscaras de entrada**


  - Valide os campos


- Teste **Editar tutor**


- Teste **Deletar tutor** com confirmação


- Busque por CPF ou nome






#### 4️ **Testar Gerenciamento de Pets**






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






#### 5️ **Testar Dashboard**






- Visualize **resumo de dados**:


  - Total de tutores


  - Total de pets


  - Últimos registros


- Verifique **atualização em tempo real**






#### 6️ **Testar Validações**






teste de mascara Tente enviar formulários com dados inválidos:


- CPF inválido


- Telefone incompleto


- Campos vazios


- Emails malformados


---
### Monitoramento Durante Testes






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


### Dicas Importantes


1. **Primeira Execução:** Pode levar 2-3 minutos para completar o build


2. **Recarregue o Navegador:** Se vir tela em branco, aguarde alguns segundos


3. **Limpe Cache:** Pressione F5 ou Ctrl+R para atualizar


4. **Modo Offline:** Verifique conexão com a API backend


5. **Desenvolvimento:** Use `ng serve` localmente (mais rápido)


6. **Produção:** Use Docker Compose (mais confiável)


---


# Caso de erro no docker


##  Instalação e Execução
### Rodar Local
```bash


# Clonar repositório
git clone https://github.com/carlosvitorvieiramattos/carlosmattos066646.git
#copiar cd:
cd carlosmattos066646
# Instalar dependências
npm install
# Iniciar servidor de desenvolvimento
ng serve
# Acessar aplicação
```
```bash
 http://localhost:4200


```
---
### Executar Testes
```bash
# Testes unitários
ng test
# Testes com cobertura
ng test --code-coverage
# Testes E2E
ng e2e
```
---
# Tela


### Pets
* Listagem /pets
Lista de Pets com filtro de nome e raça


* Detalhamento /pets/:id
Detalhes do Pet, tutores vinculados e exclusão


* Cadastro /pets/novo
Cadastro de Pet


* Edição /pets/editar/:id
Edição de Pet


### Tutores
* Listagem /tutores
Lista de Tutores com filtro por nome


* Detalhamento /tutores/:id
Detalhes do Tutor, pets vinculados e exclusão


* Cadastro /tutores/:id
Cadastro do tutor


* Edição /tutores/:id
Edição do tutor


### Vincular
* Pet ao Instrutor /tutores/:id/pet/novo
Exibição do tutor com a listagem de pets para vincular


* Instrutor ao Pet /pets/:id/tutor/novo
Exibição do pet com a listagem de tutores para vincular




### Observação
## Identidade Visual e Design


O sistema possui um layout intuitivo, focado na experiência do usuário, utilizando uma paleta de cores branca com **laranja vibrante**, proporcionando um ambiente limpo e moderno.


### Atribuições de Design:
* **Logotipo:** A identidade visual foi desenvolvida utilizando um modelo base do site [Freepik - Logos](https://br.freepik.com/modelos/logos).
* **Ícones:** Para a interface e navegação, foram utilizados os ícones oficiais do [Bootstrap Icons](https://icons.getbootstrap.com/).
---
# Observação
O perfil 2 : carvt123-blip /carlosvieiramattos sou eu estava usando o pc da minha casa e do serviço para criar o projeto
meus e-mail: carvt.123@gmail.com/ carvt.vvm@gmail.com
Desenvolvido pelo analista Carlos Vitor Vieira Mattos - 05/02/ 2026




