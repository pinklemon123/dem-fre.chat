FROM node:20-alpine

WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 8080
CMD ["npm", "start"]

