FROM node:latest AS builder
WORKDIR /app
COPY package*.json ./
RUN git submodule update --remote
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "dev"]
