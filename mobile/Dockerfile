FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache git

# Instalar Expo CLI globalmente
RUN npm install -g expo-cli@latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Expo ports
EXPOSE 19000 19001 19002

# Start Expo development server
CMD ["npx", "expo", "start", "--host", "tunnel"]

