#!/bin/bash
# Ordo.sh - Auto-configuration startup script
# This script auto-configures clawdbot based on environment variables

set -e

CONFIG_DIR="$HOME/.clawdbot"
CONFIG_FILE="$CONFIG_DIR/clawdbot.json"

# Create 'ordo' alias for clawdbot
echo 'alias ordo="clawdbot"' >> "$HOME/.bashrc"
echo 'alias ordo="clawdbot"' >> "$HOME/.profile"

echo ""
echo "  ░█▀█░█▀▄░█▀▄░█▀█"
echo "  ░█░█░█▀▄░█░█░█░█"
echo "  ░▀▀▀░▀░▀░▀▀░░▀▀▀"
echo ""
echo "  Welcome to Ordo"
echo "  Your AI Assistant in the Cloud"
echo ""
echo "========================================"
echo ""

# Create config directory and workspace
mkdir -p "$CONFIG_DIR"
mkdir -p "$HOME/ordo"

# Check if we should auto-configure
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
  echo "Auto-configuring clawdbot..."

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
    echo "  - Telegram bot configured"
    config=$(echo "$config" | jq --arg token "$TELEGRAM_TOKEN" '.channels.telegram = {
      "enabled": true
    }')
    # Set telegram token via environment variable (clawdbot reads from env)
    export TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN"
  fi

  # Add Discord channel if token provided
  if [ -n "$DISCORD_TOKEN" ]; then
    echo "  - Discord bot configured"
    config=$(echo "$config" | jq '.channels.discord = {
      "enabled": true
    }')
    # Set discord token via environment variable
    export DISCORD_BOT_TOKEN="$DISCORD_TOKEN"
  fi

  # Add Slack channel if token provided
  if [ -n "$SLACK_TOKEN" ]; then
    echo "  - Slack bot configured"
    config=$(echo "$config" | jq '.channels.slack = {
      "enabled": true
    }')
    # Set slack token via environment variable
    export SLACK_BOT_TOKEN="$SLACK_TOKEN"
  fi

  # Add WhatsApp channel if token provided
  if [ -n "$WHATSAPP_TOKEN" ]; then
    echo "  - WhatsApp configured"
    config=$(echo "$config" | jq '.channels.whatsapp = {
      "enabled": true
    }')
    # Set whatsapp token via environment variable
    export WHATSAPP_BOT_TOKEN="$WHATSAPP_TOKEN"
  fi

  # Check if no API key
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "  ! No Anthropic API key found"
  else
    echo "  - Anthropic API key detected (set via env)"
  fi

  # Write config file
  echo "$config" | jq '.' > "$CONFIG_FILE"
  echo ""
  echo "Configuration saved to $CONFIG_FILE"
  echo ""

  # Count configured channels
  channel_count=$(echo "$config" | jq '.channels | length')

  # Generate gateway auth token
  echo "Generating gateway auth token..."
  clawdbot config set gateway.auth.mode token 2>/dev/null || true
  
  # Start clawdbot gateway in the background if API key is set and channels configured
  if [ -n "$ANTHROPIC_API_KEY" ] && [ "$channel_count" -gt 0 ]; then
    echo "Starting clawdbot gateway..."
    # Export the API key so clawdbot can use it
    export ANTHROPIC_API_KEY

    # Start the gateway with verbose logging
    nohup clawdbot gateway --port 18789 --verbose > "$HOME/.clawdbot/clawdbot.log" 2>&1 &
    GATEWAY_PID=$!
    sleep 5

    if kill -0 $GATEWAY_PID 2>/dev/null; then
      echo ""
      echo "========================================"
      echo "  ✓ Ordo is running!"
      echo "========================================"
      echo ""
      echo "  Your AI assistant is now listening"
      echo "  for messages on your channels."
      echo ""
      echo "  Commands:"
      echo "    ordo status    - Check status"
      echo "    ordo doctor    - Diagnose issues"
      echo "    ordo --help    - All commands"
      echo ""
      echo "  Logs: tail -f ~/.clawdbot/clawdbot.log"
      echo ""
    else
      echo ""
      echo "! Ordo may have failed to start."
      echo "  Check logs: cat ~/.clawdbot/clawdbot.log"
      echo ""
      echo "  To fix, run:"
      echo "    ordo doctor --fix"
      echo "    ordo gateway"
      echo ""
    fi
  else
    if [ -z "$ANTHROPIC_API_KEY" ]; then
      echo "! Missing Anthropic API key."
    fi
    if [ "$channel_count" -eq 0 ]; then
      echo "! No channels configured."
    fi
    echo ""
    echo "To set up manually, run:"
    echo "  ordo doctor --fix"
    echo "  ordo gateway"
  fi
else
  echo "Manual configuration mode."
  echo ""
  echo "To set up your bot, run:"
  echo "  ordo doctor --fix"
  echo "  ordo gateway"
fi

echo ""
echo "========================================"
echo "  Terminal ready - type 'ordo' to start"
echo "========================================"
echo ""

# Start ttyd with bash
exec ttyd -W -p 7681 bash -l
