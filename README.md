# 🐾 Pet Registry - Sistema de Registro de Pets e Tutores

## 📋 Sumário Executivo
Aplicação Angular moderna para gerenciamento de pets e tutores, desenvolvida com arquitetura escalável, padrões enterprise e containerização Docker.

**Candidato:** Carlos Mattos  
**Inscrição:** 16463  
**Vaga:** Desenvolvedor Angular Sênior  
**Instituição:** SEPLAG-MT

---

## ✨ Funcionalidades Principais
- 🔐 **Autenticação:** Sistema JWT completo com Guards e Interceptors.
- 🐕 **Gestão de Pets e Tutores:** CRUD completo com vínculo dinâmico entre registros.
- 📸 **Upload de Fotos:** Funcionalidade de upload para pets e tutores.
- 📊 **Dashboard:** Resumo estatístico de dados em tempo real.
- ⚡ **UX/UI:** Validações de formulários, máscaras de entrada (CPF/Fone) e layout responsivo.
- 🩺 **Monitoramento:** Health checks integrados via Nginx e Docker.

---

## 🚀 Como Executar o Sistema

Siga os passos abaixo para configurar e rodar a aplicação via Docker:

### 1. Pré-requisitos
Certifique-se de possuir o **Git** e o **Docker Desktop** instalados e ativos.

### 2. Limpeza do Ambiente (Recomendado)
Para evitar conflitos com outros projetos, execute no seu terminal:

```bash
# Para todos os containers em execução
docker rm -f $(docker ps -aq)

# Remove containers parados, redes e imagens sem uso
docker system prune -a --volumes -f