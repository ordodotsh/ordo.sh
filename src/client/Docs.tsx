import { Link } from 'react-router-dom'

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `Ordo gives you a dedicated AI assistant running 24/7 in the cloud. No hardware required — just connect your wallet and start chatting.

**Requirements:**
- A Solana wallet (Phantom or Solflare recommended)
- 0.2 SOL for monthly subscription
- Telegram, Discord, WhatsApp, or Slack account`,
  },
  {
    id: 'how-it-works',
    title: 'How It Works',
    content: `When you subscribe, we spin up a dedicated Ubuntu cloud instance just for you. This instance runs **OpenClaw** — an open-source AI assistant framework.

**Your instance includes:**
- Persistent memory that remembers your preferences and context
- Web browsing and research capabilities
- File management and document processing
- Integrations with 50+ services (GitHub, Gmail, Calendar, etc.)
- 24/7 uptime — your assistant never sleeps

Everything runs on your dedicated VM. Your data stays private and isolated from other users.`,
  },
  {
    id: 'openclaw',
    title: 'Powered by OpenClaw',
    content: `Ordo.sh runs **OpenClaw** under the hood — an open-source AI assistant framework. Think of ordo.sh as "hosted OpenClaw" so you don't have to manage the infrastructure yourself.

**What is OpenClaw?**
OpenClaw bridges messaging platforms (WhatsApp, Telegram, Discord, iMessage) to AI coding agents. It handles the gateway, sessions, memory, and all the plumbing.

**OpenClaw Documentation:**
For deeper technical details, check out the official OpenClaw docs:
- [docs.openclaw.ai](https://docs.openclaw.ai) — Full documentation
- [Getting Started](https://docs.openclaw.ai/start/getting-started) — Setup guides
- [Concepts](https://docs.openclaw.ai/concepts/agent) — How agents work
- [GitHub](https://github.com/openclaw/openclaw) — Source code

**Key OpenClaw concepts:**
- **Gateway** — The long-running process that manages channel connections
- **Sessions** — Conversation threads with your agent
- **Workspace** — Your agent's home directory for files and memory
- **Skills** — Plugins that extend what your agent can do`,
  },
  {
    id: 'your-system',
    title: 'Your System (Ubuntu Linux)',
    content: `Your Ordo instance runs on **Ubuntu Linux** — a popular, stable Linux distribution. Here's what you're working with:

**System specs:**
- Ubuntu 22.04 LTS (Long Term Support)
- Dedicated CPU and RAM for your instance
- Persistent storage for your files and data
- Pre-installed: Node.js, Python, common dev tools

**Key directories:**
- \`~/.openclaw/workspace\` — Your agent's workspace (files, memory, projects)
- \`~/.openclaw/openclaw.json\` — Configuration file
- \`~/.openclaw/sessions/\` — Conversation history

**Your agent can:**
- Read and write files in the workspace
- Run shell commands
- Install packages (npm, pip, apt)
- Browse the web
- Manage git repositories`,
  },
  {
    id: 'terminal-basics',
    title: 'Terminal & CLI Basics',
    content: `Your agent uses the Linux terminal to get things done. Here are essential commands you might see or use:

**Navigation:**
- \`ls\` — List files in current directory
- \`cd <folder>\` — Change directory
- \`pwd\` — Print current directory
- \`cat <file>\` — View file contents

**File operations:**
- \`mkdir <name>\` — Create a directory
- \`touch <file>\` — Create empty file
- \`cp <src> <dest>\` — Copy file
- \`mv <src> <dest>\` — Move/rename file
- \`rm <file>\` — Delete file (use \`trash\` instead when possible)

**Useful commands:**
- \`openclaw status\` — Check OpenClaw status
- \`openclaw doctor\` — Diagnose issues
- \`git status\` — Check git repository state
- \`npm install\` — Install Node.js packages

**Pro tip:** Your agent handles most terminal work for you. Just ask it to do things in plain English — it knows how to translate that into commands.`,
  },
  {
    id: 'connect-wallet',
    title: 'Connecting Your Wallet',
    content: `Click the "Connect Wallet" button on the homepage. We support:

- **Phantom** — Most popular Solana wallet
- **Solflare** — Feature-rich alternative

Once connected, you can subscribe by paying 0.2 SOL. The subscription renews monthly — cancel anytime by simply not renewing.

*Why crypto?* No credit cards, no KYC, no middlemen. Connect and go.`,
  },
  {
    id: 'messaging',
    title: 'Connecting Messaging Platforms',
    content: `After subscribing, you'll get setup instructions for your preferred platform:

**Telegram**
1. Start a chat with your dedicated bot
2. Send /start to activate
3. That's it — start chatting!

**Discord**
1. Add the Ordo bot to your server or DM it directly
2. Use the /setup command with your subscription key
3. Your assistant is ready

**WhatsApp & Slack**
Coming soon! Follow @ordodotsh for updates.`,
  },
  {
    id: 'capabilities',
    title: 'What Your Ordo Can Do',
    content: `Your AI assistant can help with a wide range of tasks:

**Research & Information**
- Search the web and summarize findings
- Read and analyze articles, PDFs, documents
- Track topics and send you updates

**Productivity**
- Manage your calendar and set reminders
- Draft emails and messages
- Organize files and notes

**Development**
- Write and review code
- Create GitHub issues and PRs
- Debug problems and explain solutions
- Deploy to Vercel, Netlify, Railway

**Automation**
- Set up recurring tasks (cron jobs)
- Monitor websites for changes
- Create custom workflows

**Memory**
- Remembers your preferences over time
- Maintains context across conversations
- Gets smarter the more you use it`,
  },
  {
    id: 'slash-commands',
    title: 'Slash Commands',
    content: `Your agent responds to slash commands for quick actions:

**Common commands:**
- \`/status\` — Check agent status and session info
- \`/model <name>\` — Switch AI model (e.g., /model claude-sonnet)
- \`/reasoning on|off\` — Toggle extended thinking
- \`/clear\` — Clear conversation context
- \`/help\` — Show available commands

**Session management:**
- \`/sessions\` — List active sessions
- \`/compact\` — Compress conversation history

**Configuration:**
- \`/verbose on|off\` — Toggle detailed responses
- \`/activation always|mention\` — Set group chat activation mode

For the full list, check [OpenClaw slash commands](https://docs.openclaw.ai/tools/slash-commands).`,
  },
  {
    id: 'pricing',
    title: 'Pricing',
    content: `**0.2 SOL / month**

This covers:
- Dedicated cloud VM running 24/7
- Unlimited messages with your assistant
- All integrations and capabilities
- Persistent memory and context

No hidden fees. No usage limits. Cancel anytime.

*Why this price?* Running a dedicated cloud instance 24/7 costs real money. We're not running a shared service — you get your own isolated environment.`,
  },
  {
    id: 'faq',
    title: 'FAQ',
    content: `**Is my data private?**
Yes. Each subscriber gets their own dedicated VM. Your conversations, files, and data are isolated from other users. We don't train on your data.

**What AI model do you use?**
OpenClaw supports multiple models including Claude (Anthropic) and GPT-4 (OpenAI). You can configure your preferred model.

**Can I self-host instead?**
Absolutely! OpenClaw is open-source. Check out [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) to run it yourself. Ordo is for people who want the capability without the setup hassle.

**Can I SSH into my instance?**
Not directly, but your agent can run any terminal command for you. Just ask!

**What if I have issues?**
Reach out on X [@ordodotsh](https://x.com/ordodotsh) or join our community. We're here to help.

**Is there a free trial?**
Not currently, but we're considering it. Follow us for updates.`,
  },
  {
    id: 'resources',
    title: 'Resources & Links',
    content: `**Ordo.sh**
- Website: [ordo.sh](https://ordo.sh)
- X/Twitter: [@ordodotsh](https://x.com/ordodotsh)
- GitHub: [github.com/ordodotsh](https://github.com/ordodotsh)

**OpenClaw (the engine)**
- Docs: [docs.openclaw.ai](https://docs.openclaw.ai)
- GitHub: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- Discord: [OpenClaw community](https://discord.com/invite/clawd)

**Learn more:**
- [OpenClaw Getting Started](https://docs.openclaw.ai/start/getting-started)
- [Agent Workspace](https://docs.openclaw.ai/concepts/agent-workspace)
- [Skills & Plugins](https://docs.openclaw.ai/tools/skills)
- [Automation & Cron](https://docs.openclaw.ai/automation/cron-jobs)`,
  },
]

export function Docs() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <Link to="/" style={styles.backLink}>
            ← Back to ordo.sh
          </Link>
          <h1 style={styles.title}>Documentation</h1>
          <p style={styles.subtitle}>
            Everything you need to know about running your AI assistant in the cloud
          </p>
        </header>

        {/* Table of Contents */}
        <nav style={styles.toc}>
          <h2 style={styles.tocTitle}>Contents</h2>
          <ul style={styles.tocList}>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} style={styles.tocLink}>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <main style={styles.main}>
          {sections.map((section) => (
            <section key={section.id} id={section.id} style={styles.section}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <div style={styles.sectionContent}>
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} style={styles.paragraph}>
                    {formatText(paragraph)}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Questions? Reach out on{' '}
            <a href="https://x.com/ordodotsh" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              X @ordodotsh
            </a>
          </p>
          <p style={styles.footerMotto}>ab chao, ordo</p>
        </footer>
      </div>
    </div>
  )
}

// Simple markdown-like formatting
function formatText(text: string): React.ReactNode {
  // Handle code blocks first (backticks)
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/)
  
  return parts.map((part, i) => {
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    // Inline code
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={styles.inlineCode}>{part.slice(1, -1)}</code>
    }
    // Links
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={styles.inlineLink}>
          {linkMatch[1]}
        </a>
      )
    }
    // Handle line breaks and lists within paragraphs
    if (part.includes('\n')) {
      return part.split('\n').map((line, j) => {
        if (line.startsWith('- ')) {
          return <span key={`${i}-${j}`} style={styles.listItem}>• {formatText(line.slice(2))}<br /></span>
        }
        return <span key={`${i}-${j}`}>{line}<br /></span>
      })
    }
    return part
  })
}

const colors = {
  bg: '#FAF9F7',
  bgAlt: '#F5F4F1',
  text: '#1A1715',
  textSecondary: '#6B6560',
  textMuted: '#9A9590',
  accent: '#D97706',
  border: '#E8E6E3',
  cardBg: '#FFFFFF',
  codeBg: '#F3F4F6',
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: colors.bg,
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    marginBottom: 48,
  },
  backLink: {
    display: 'inline-block',
    color: colors.accent,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
  },
  toc: {
    padding: 24,
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    marginBottom: 48,
  },
  tocTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  tocList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 8,
  },
  tocLink: {
    color: colors.text,
    textDecoration: 'none',
    fontSize: 15,
    lineHeight: 1.8,
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: 48,
  },
  section: {
    paddingTop: 24,
    borderTop: `1px solid ${colors.border}`,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 16,
  },
  sectionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 1.7,
    margin: 0,
  },
  listItem: {
    display: 'block',
    paddingLeft: 16,
  },
  inlineLink: {
    color: colors.accent,
    textDecoration: 'none',
  },
  inlineCode: {
    background: colors.codeBg,
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 64,
    paddingTop: 32,
    borderTop: `1px solid ${colors.border}`,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footerLink: {
    color: colors.accent,
    textDecoration: 'none',
  },
  footerMotto: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
}
