#!/bin/bash
# Ordo.sh - Auto-configuration startup script
# This script auto-configures clawdbot based on environment variables

set -e

CONFIG_DIR="$HOME/.clawdbot"
CONFIG_FILE="$CONFIG_DIR/clawdbot.json"

# Create config directory and workspace
mkdir -p "$CONFIG_DIR"
mkdir -p "$HOME/ordo"

# Make .profile source .bashrc (login shells don't read .bashrc by default)
echo '[ -f ~/.bashrc ] && source ~/.bashrc' >> "$HOME/.profile"

# Create 'ordo' alias and welcome message in .bashrc
cat >> "$HOME/.bashrc" << 'BASHRC'
# Ordo.sh configuration
alias ordo="clawdbot"

# Welcome message (only show once per session)
if [ -z "$ORDO_WELCOMED" ]; then
  export ORDO_WELCOMED=1
  echo ""
  echo "  ░█▀█░█▀▄░█▀▄░█▀█"
  echo "  ░█░█░█▀▄░█░█░█░█"
  echo "  ░▀▀▀░▀░▀░▀▀░░▀▀▀"
  echo ""
  echo "  Welcome to Ordo"
  echo "  Your AI Assistant in the Cloud"
  echo ""
  echo "  Commands:"
  echo "    ordo status   - Check bot status"
  echo "    ordo doctor   - Diagnose issues"  
  echo "    ordo --help   - All commands"
  echo ""
  # Check if gateway is running
  if pgrep -f "clawdbot gateway" > /dev/null 2>&1; then
    echo "  ✓ Bot is running! Message your bot to chat."
  else
    echo "  ⚠ Bot starting... run 'ordo status' to check."
  fi
  echo ""
fi
BASHRC

# Check if we should auto-configure
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
  # Silent auto-configuration (output goes to log)

  # Start building the config JSON with proper clawdbot structure (2026.1.x format)
  config='{
    "agents": {
      "defaults": {
        "workspace": "~/ordo",
        "model": {
          "primary": "anthropic/claude-opus-4-20250514"
        }
      }
    },
    "gateway": {
      "port": 18789,
      "mode": "local"
    },
    "channels": {}
  }'

  # Add Telegram channel if token provided
  if [ -n "$TELEGRAM_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.telegram = { "enabled": true }')
    export TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN"
  fi

  # Add Discord channel if token provided
  if [ -n "$DISCORD_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.discord = { "enabled": true }')
    export DISCORD_BOT_TOKEN="$DISCORD_TOKEN"
  fi

  # Add Slack channel if token provided
  if [ -n "$SLACK_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.slack = { "enabled": true }')
    export SLACK_BOT_TOKEN="$SLACK_TOKEN"
  fi

  # Add WhatsApp channel if token provided
  if [ -n "$WHATSAPP_TOKEN" ]; then
    config=$(echo "$config" | jq '.channels.whatsapp = { "enabled": true }')
    export WHATSAPP_BOT_TOKEN="$WHATSAPP_TOKEN"
  fi

  # Write config file
  echo "$config" | jq '.' > "$CONFIG_FILE"

  # Count configured channels
  channel_count=$(echo "$config" | jq '.channels | length')

  # Generate gateway auth token (silent)
  clawdbot config set gateway.auth.mode token 2>/dev/null || true
  
  # Save env vars FIRST (before starting gateway)
  echo "export ANTHROPIC_API_KEY='$ANTHROPIC_API_KEY'" >> "$HOME/.bashrc"
  [ -n "$TELEGRAM_BOT_TOKEN" ] && echo "export TELEGRAM_BOT_TOKEN='$TELEGRAM_BOT_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$DISCORD_BOT_TOKEN" ] && echo "export DISCORD_BOT_TOKEN='$DISCORD_BOT_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$SLACK_BOT_TOKEN" ] && echo "export SLACK_BOT_TOKEN='$SLACK_BOT_TOKEN'" >> "$HOME/.bashrc"
  [ -n "$WHATSAPP_BOT_TOKEN" ] && echo "export WHATSAPP_BOT_TOKEN='$WHATSAPP_BOT_TOKEN'" >> "$HOME/.bashrc"

  # Start clawdbot gateway in the background if API key is set and channels configured
  if [ -n "$ANTHROPIC_API_KEY" ] && [ "$channel_count" -gt 0 ]; then
    # Run doctor --fix to enable configured channels
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    clawdbot doctor --fix 2>/dev/null || true

    # Start the gateway with env vars explicitly passed
    ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
    DISCORD_BOT_TOKEN="$DISCORD_BOT_TOKEN" \
    SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN" \
    WHATSAPP_BOT_TOKEN="$WHATSAPP_BOT_TOKEN" \
    nohup clawdbot gateway --port 18789 --verbose > "$HOME/.clawdbot/clawdbot.log" 2>&1 &
  fi
fi

# Start ttyd with bash
exec ttyd -W -p 7681 bash -l
