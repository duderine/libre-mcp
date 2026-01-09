FROM node:24

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY config/ ./config/
COPY src/ ./src/

# Install production dependencies
RUN npm install --production --silent

# Run with TypeScript support (like setup-env.ts)
CMD ["node", "--experimental-strip-types", "--no-warnings", "src/init.ts"]
