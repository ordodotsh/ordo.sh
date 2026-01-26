# Ordo Bot - Personal AI Assistant
# Container: ghcr.io/ordodotsh/ordo-bot
FROM oven/bun:1-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git curl

# Copy bot package files
COPY bot/package.json ./

# Install dependencies
RUN bun install

# Copy bot source
COPY bot/ ./

# Environment variables (set at runtime)
ENV USER_WALLET=""
ENV ANTHROPIC_API_KEY=""
ENV TELEGRAM_BOT_TOKEN=""
ENV DISCORD_BOT_TOKEN=""

# Run the bot
CMD ["bun", "run", "index.ts"]
