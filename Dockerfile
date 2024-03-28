FROM node:latest AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN git submodule update --remote --merge
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "dev"]
