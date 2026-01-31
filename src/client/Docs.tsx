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
    content: `When you subscribe, we spin up a dedicated Ubuntu cloud instance just for you. This instance runs OpenClaw (Moltbot) — an open-source AI assistant framework with 60k+ GitHub stars.

**Your instance includes:**
- Persistent memory that remembers your preferences and context
- Web browsing and research capabilities
- File management and document processing
- Integrations with 50+ services (GitHub, Gmail, Calendar, etc.)
- 24/7 uptime — your assistant never sleeps

Everything runs on your dedicated VM. Your data stays private and isolated from other users.`,
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

**Automation**
- Set up recurring tasks
- Monitor websites for changes
- Create custom workflows

**Memory**
- Remembers your preferences over time
- Maintains context across conversations
- Gets smarter the more you use it`,
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

**What if I have issues?**
Reach out on X [@ordodotsh](https://x.com/ordodotsh) or join our community. We're here to help.

**Is there a free trial?**
Not currently, but we're considering it. Follow us for updates.`,
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
  // Handle bold
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
  
  return parts.map((part, i) => {
    // Bold
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
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
          return <span key={`${i}-${j}`} style={styles.listItem}>• {line.slice(2)}<br /></span>
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
