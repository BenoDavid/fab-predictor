FROM node:20-alpine

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli

# Copy only package files first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the app (node_modules excluded via .dockerignore)
COPY . .

EXPOSE 4201

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4201"]
