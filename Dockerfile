# ---- Stage 1: Builder ----
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# Use npm ci for reproducible builds
RUN npm ci

# Copy project files
# The .dockerignore file will prevent node_modules and .next from being copied
COPY . .

# Copy the public directory from src to the root for the build process to find it.
# This is necessary because the project uses a non-standard `src/public` structure.
RUN cp -r /app/src/public /app/public

# Build Next.js in standalone mode
RUN npm run build

# ---- Stage 2: Runner ----
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# The PORT environment variable is used by the Next.js server
ENV PORT=3000

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# Copy only the necessary files from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Install curl for healthcheck
RUN apk add --no-cache curl

# Change ownership to non-root user
# Change ownership of the app directory to the non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Add a healthcheck to verify the container is running correctly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start server
CMD ["node", "server.js"]
