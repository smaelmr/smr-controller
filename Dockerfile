# Etapa 1: build (usa Node para compilar)
FROM node:lts-alpine AS build
WORKDIR /app

# Instala deps com cache eficiente
COPY package*.json ./
RUN npm ci

# Copia o restante e builda
COPY . .
# Se usar Vite: npm run build
# Se usar CRA/Webpack: npm run build
RUN npm run build

# Etapa 2: runtime (serve com Nginx)
FROM nginx:stable-alpine

# Copia configuração do Nginx (opcional, veja exemplo abaixo)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos do build para a raiz web do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Se seu build sai em "build" (Create React App), use:
# COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Sobe o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
