#!/bin/bash
# Ordo.sh - Auto-configuration startup script
# This script auto-configures clawdbot based on environment variables

set -e

CONFIG_DIR="$HOME/.clawdbot"
CONFIG_FILE="$CONFIG_DIR/config.json"

echo "========================================"
echo "  Welcome to Ordo.sh"
echo "  Your AI Assistant Platform"
echo "========================================"
echo ""

# Create config directory
mkdir -p "$CONFIG_DIR"

# Check if we should auto-configure
if [ "$ORDO_AUTO_CONFIG" = "true" ]; then
  echo "Auto-configuring clawdbot..."

  # Build the config JSON
  config='{}'

  # Add Anthropic API key if provided
  if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "  - Anthropic API key configured"
    config=$(echo "$config" | jq --arg key "$ANTHROPIC_API_KEY" '. + {anthropicApiKey: $key}')
  else
    echo "  ! No Anthropic API key found"
  fi

  # Build channels array
  channels='[]'

  # Telegram
  if [ -n "$TELEGRAM_TOKEN" ]; then
    echo "  - Telegram bot configured"
    channels=$(echo "$channels" | jq --arg token "$TELEGRAM_TOKEN" '. + [{type: "telegram", token: $token, enabled: true}]')
  fi

  # Discord
  if [ -n "$DISCORD_TOKEN" ]; then
    echo "  - Discord bot configured"
    channels=$(echo "$channels" | jq --arg token "$DISCORD_TOKEN" '. + [{type: "discord", token: $token, enabled: true}]')
  fi

  # Slack
  if [ -n "$SLACK_TOKEN" ]; then
    echo "  - Slack bot configured"
    channels=$(echo "$channels" | jq --arg token "$SLACK_TOKEN" '. + [{type: "slack", token: $token, enabled: true}]')
  fi

  # WhatsApp
  if [ -n "$WHATSAPP_TOKEN" ]; then
    echo "  - WhatsApp configured"
    channels=$(echo "$channels" | jq --arg token "$WHATSAPP_TOKEN" '. + [{type: "whatsapp", token: $token, enabled: true}]')
  fi

  # Add channels to config
  config=$(echo "$config" | jq --argjson channels "$channels" '. + {channels: $channels}')

  # Write config file
  echo "$config" > "$CONFIG_FILE"
  echo ""
  echo "Configuration saved to $CONFIG_FILE"
  echo ""

  # Start clawdbot in the background if API key is set
  if [ -n "$ANTHROPIC_API_KEY" ] && [ "$(echo "$channels" | jq 'length')" -gt 0 ]; then
    echo "Starting clawdbot..."
    nohup clawdbot start > "$HOME/.clawdbot/clawdbot.log" 2>&1 &
    echo "Clawdbot is running in the background."
    echo "View logs: tail -f ~/.clawdbot/clawdbot.log"
  else
    echo "Clawdbot not started - missing API key or channels."
    echo "Run 'clawdbot onboard' to configure manually."
  fi
else
  echo "Manual configuration mode."
  echo "Run 'clawdbot onboard' to set up your bot."
fi

echo ""
echo "========================================"
echo "  Terminal ready"
echo "  Type 'clawdbot --help' for commands"
echo "========================================"
echo ""

# Start ttyd with bash
exec ttyd -W -p 7681 bash -l
