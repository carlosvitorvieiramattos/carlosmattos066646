# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration production

# Estágio 2: Servidor de Produção
FROM nginx:alpine
COPY --from=build /app/dist/app.pets/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Requisito Sênior: Healthcheck de Liveness/Readiness
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
