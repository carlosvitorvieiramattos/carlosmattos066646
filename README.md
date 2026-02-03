# Desafio Técnico SEPLAG-MT | Desenvolvedor Sênior

## 📝 Dados do Candidato
- **Nome:** Carlos Mattos
- **Vaga:** Desenvolvedor Angular Sênior
- **Projeto:** Sistema de Registro Público de Pets e Tutores

## 🏛️ Arquitetura (Requisitos Sênior)
- **Padrão Facade:** Centralização da lógica de negócio e abstração de serviços.
- **Gerenciamento de Estado:** Uso de `BehaviorSubject` para reatividade e persistência.
- **Health Checks:** Endpoint `/health` no Nginx e `HEALTHCHECK` no Dockerfile (Liveness/Readiness).

## 🚀 Como Executar
1. **Docker:** `docker build -t app-pets .` e `docker run -p 8080:80 app-pets`
2. **Local:** `npm install` e `ng serve`
