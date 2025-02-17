# Use a base image with Node.js
FROM node:18 AS edusynapse

# Set working directory
WORKDIR /app

# Clone the EduSynapse repository
RUN git clone https://github.com/monster0506/edusynapse.git . 

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Expose port for Next.js app
EXPOSE 3000

# Start EduSynapse
CMD ["npm", "run", "dev"]

# -----------------------------

# Use Ollama's official image
FROM ollama/ollama AS ollama

# Set the model path
ENV OLLAMA_MODELS=/models

# Mount the SSD at E:\models to /models
VOLUME ["/models"]

# Expose Ollama's default port
EXPOSE 11434

# -----------------------------

# PostgreSQL setup
FROM postgres:16 AS database

# Set environment variables (modify as needed)
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=edusynapse

# Expose PostgreSQL default port
EXPOSE 5432
