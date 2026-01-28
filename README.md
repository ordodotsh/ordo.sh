<div align="center">

# ordo.sh

### *ab chao, ordo* — from chaos, order

**Your personal AI assistant in the cloud**

[![Live Demo](https://img.shields.io/badge/demo-ordo.sh-D97706?style=for-the-badge)](https://ordo.sh)
[![Built with Convex](https://img.shields.io/badge/backend-Convex-8B5CF6?style=for-the-badge)](https://convex.dev)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20Opus-CC785C?style=for-the-badge)](https://anthropic.com)
[![Deploy on DigitalOcean](https://img.shields.io/badge/hosting-DigitalOcean-0080FF?style=for-the-badge)](https://digitalocean.com)

<br />

<img src="https://img.shields.io/badge/Telegram-2CA5E0?style=flat-square&logo=telegram&logoColor=white" alt="Telegram" />
<img src="https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" />
<img src="https://img.shields.io/badge/WhatsApp-25D366?style=flat-square&logo=whatsapp&logoColor=white" alt="WhatsApp" />
<img src="https://img.shields.io/badge/Slack-4A154B?style=flat-square&logo=slack&logoColor=white" alt="Slack" />

</div>

---

## The Problem

Running your own AI assistant requires a dedicated Mac mini or always-on laptop. That's **$500+ in hardware**, plus electricity, maintenance, and setup headaches.

## The Solution

Ordo gives you a **dedicated cloud instance** running 24/7. Same power, zero hardware. Connect your Solana wallet and start chatting.

---

## Features

| Feature | Description |
|---------|-------------|
| **Persistent Memory** | Remembers your preferences, past conversations, and context. Gets smarter over time. |
| **Browse & Research** | Searches the web, reads articles, fills forms, extracts data from any site. |
| **File Management** | Organize files, process documents, manage your digital workspace. |
| **Automations** | Set up recurring tasks, reminders, and workflows that run automatically. |
| **Integrations** | Connect to GitHub, Gmail, Notion, Calendar, and 50+ other services. |
| **Your Own Instance** | Dedicated VM just for you. Your data stays private and secure. |
| **Autonomous Deployment** | Bot can create GitHub repos, deploy to Vercel/Netlify/Railway, and launch sites. |
| **Full Desktop Access** | Remote desktop via noVNC - watch your bot work in real-time. |
| **Multi-Model Support** | Claude, GPT-4, Gemini - use whichever AI model you prefer. |

---

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  1. Connect     │────▶│  2. Pay 0.2 SOL │────▶│  3. Start       │
│     Wallet      │     │     /month      │     │     Chatting    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Connect Wallet** — Sign in with your Solana wallet. No email, no password.
2. **Pay 0.2 SOL** — Monthly subscription. Cancel anytime.
3. **Start Chatting** — Connect Telegram or Discord and start giving tasks.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TypeScript |
| **Backend** | [Convex](https://convex.dev) (real-time database + serverless functions) |
| **AI** | [Claude Opus](https://anthropic.com) by Anthropic |
| **VM Hosting** | [DigitalOcean](https://digitalocean.com) (dedicated droplets per user) |
| **Payments** | Solana (SOL) via wallet adapter |
| **Bot Platforms** | Telegram, Discord (WhatsApp & Slack coming soon) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         User                                  │
│                           │                                   │
│              ┌────────────┼────────────┐                     │
│              ▼            ▼            ▼                     │
│         Telegram      Discord      WhatsApp                  │
│              │            │            │                     │
│              └────────────┼────────────┘                     │
│                           │                                   │
│                           ▼                                   │
│              ┌────────────────────────┐                      │
│              │  DigitalOcean Droplet  │                      │
│              │  (Dedicated per user)  │                      │
│              │                        │                      │
│              │   ┌────────────────┐   │                      │
│              │   │   Ordo Bot     │   │                      │
│              │   │  + Claude API  │   │                      │
│              │   └────────────────┘   │                      │
│              └────────────────────────┘                      │
│                           │                                   │
│                           ▼                                   │
│              ┌────────────────────────┐                      │
│              │        Convex          │                      │
│              │   (Auth, Billing, VM   │                      │
│              │    orchestration)      │                      │
│              └────────────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Development

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Convex](https://convex.dev) account
- [DigitalOcean](https://digitalocean.com) account

### Setup

```bash
# Clone the repo
git clone https://github.com/ordodotsh/ordo.sh.git
cd ordo.sh

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Start development servers
bun run dev
```

### Environment Variables

```env
# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GOOGLE_API_KEY=...

# Solana RPC
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=...

# DigitalOcean (for VM provisioning)
DIGITALOCEAN_API_TOKEN=...

# Bot image (set in Convex dashboard)
BOT_IMAGE=ghcr.io/ordodotsh/ordo-bot:latest

# Platform Tokens (for autonomous bot deployment)
GITHUB_TOKEN=ghp_...
VERCEL_TOKEN=...
NETLIFY_AUTH_TOKEN=...
CLOUDFLARE_API_TOKEN=...
RAILWAY_TOKEN=...

# Web Search
BRAVE_API_KEY=...
```

---

## Project Structure

```
ordo.sh/
├── src/
│   ├── client/          # React frontend
│   │   ├── App.tsx      # Landing page
│   │   ├── Dashboard.tsx # User dashboard
│   │   └── WalletButton.tsx
│   └── server/          # Elysia API server
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── users.ts         # User management
│   ├── subscriptions.ts # Payment handling
│   └── vms.ts           # VM provisioning
├── bot/                 # Bot that runs on user VMs
│   └── index.ts         # Telegram/Discord bot
├── docker/
│   └── Dockerfile       # Bot container image
└── .github/
    └── workflows/
        └── docker.yml   # CI/CD for bot image
```

---

## Roadmap

- [x] Solana wallet authentication
- [x] DigitalOcean VM provisioning
- [x] Telegram bot integration
- [x] Discord bot integration
- [x] WhatsApp integration
- [x] Slack integration
- [x] Web browsing capabilities (Playwright + Chromium)
- [x] Remote desktop access (noVNC)
- [x] Autonomous GitHub/Vercel deployment
- [x] Multi-model support (Claude, GPT-4, Gemini)
- [ ] Persistent memory (vector DB)
- [ ] Voice message processing
- [ ] Custom automations builder

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT

---

<div align="center">

**[ordo.sh](https://ordo.sh)**

*Built for the [Bags Hackathon](https://bags.fm)*

</div>
