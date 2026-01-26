# Ordo.sh - Cloud Clawdbot Environment
# Container: ghcr.io/ordodotsh/ordo-bot
FROM node:22-alpine

WORKDIR /home/dev

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    bash \
    openssh-client \
    ttyd \
    && npm install -g clawdbot@latest

# Create dev user
RUN adduser -D -s /bin/bash dev && \
    chown -R dev:dev /home/dev

# Switch to dev user
USER dev

# Set up bash as default shell
ENV SHELL=/bin/bash
ENV HOME=/home/dev

# Environment variables (set at runtime)
ENV USER_WALLET=""

# Expose web terminal port
EXPOSE 7681

# Start ttyd with bash (run `clawdbot onboard` to configure)
CMD ["ttyd", "-W", "-p", "7681", "bash", "-l"]
