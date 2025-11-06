FROM n8nio/n8n:latest

# Install additional dependencies for audio processing
USER root

# Install ffmpeg for audio format conversion (optional but recommended)
RUN apk add --no-cache ffmpeg

# Switch back to node user
USER node

# Environment variables
ENV N8N_PORT=8080
ENV N8N_PROTOCOL=https
ENV NODE_ENV=production
ENV EXECUTIONS_PROCESS=main
ENV EXECUTIONS_MODE=regular

# Data persistence
ENV N8N_USER_FOLDER=/home/node/.n8n
ENV N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# Basic auth configuration
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-admin}
ENV N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}

# Database configuration (will use PostgreSQL)
ENV DB_TYPE=postgresdb
ENV DB_POSTGRESDB_HOST=${DB_HOST}
ENV DB_POSTGRESDB_PORT=${DB_PORT:-5432}
ENV DB_POSTGRESDB_DATABASE=${DB_NAME:-n8n}
ENV DB_POSTGRESDB_USER=${DB_USER}
ENV DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}

# Webhook URL
ENV WEBHOOK_URL=${WEBHOOK_URL}

# Timezone
ENV GENERIC_TIMEZONE=Europe/Istanbul
ENV TZ=Europe/Istanbul

# Logging
ENV N8N_LOG_LEVEL=info
ENV N8N_LOG_OUTPUT=console

# Performance settings
ENV N8N_PAYLOAD_SIZE_MAX=16
ENV N8N_METRICS=true

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/healthz || exit 1

# Start n8n
CMD ["n8n", "start"]
