# Estágio de Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration production

# Estágio de Servidor (Nginx)
FROM nginx:alpine

# Remove a config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos da pasta browser gerada pelo Angular
COPY --from=build /app/dist/pet-registry-mt/browser /usr/share/nginx/html

# Copia sua config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]