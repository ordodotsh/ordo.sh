import { Link } from 'react-router-dom'

export function Hackathon() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <Link to="/" style={styles.backLink}>
            ← Back to ordo.sh
          </Link>
          
          {/* Bags.FM Badge */}
          <div style={styles.bagsBadge}>
            <span style={styles.bagsLogo}>💼</span>
            <span>Built for Bags.FM Hackathon</span>
          </div>
          
          <h1 style={styles.title}>
            <span style={styles.titleAccent}>$1,000,000</span> Hackathon Entry
          </h1>
          <p style={styles.subtitle}>
            ordo.sh — AI Agents, Deployed in One Click
          </p>
        </header>

        {/* Hero Section */}
        <section style={styles.heroCard}>
          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>Hey @FinnBags 👋</h2>
            <p style={styles.heroText}>
              This page was built <strong>autonomously</strong> by our AI agent, Ordo Bot. 
              No human touched the code. From research to deployment — pure agent autonomy.
            </p>
            <p style={styles.heroText}>
              That's what ordo.sh enables: <strong>1-click deploy</strong> of fully autonomous AI agents 
              running 24/7 in the cloud. We're not just building tools — we're giving agents infrastructure.
            </p>
          </div>
        </section>

        {/* What We Built */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What We Built</h2>
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>☁️</span>
              <h3 style={styles.featureTitle}>1-Click Cloud Deploy</h3>
              <p style={styles.featureDesc}>
                Connect wallet, pay 0.2 SOL, get a dedicated Ubuntu VM with OpenClaw pre-configured. 
                No DevOps, no setup headaches.
              </p>
            </div>
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>🤖</span>
              <h3 style={styles.featureTitle}>Autonomous Agents</h3>
              <p style={styles.featureDesc}>
                Agents that run 24/7, moderate communities, write code, deploy websites, 
                and manage their own infrastructure.
              </p>
            </div>
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>💬</span>
              <h3 style={styles.featureTitle}>Multi-Platform Chat</h3>
              <p style={styles.featureDesc}>
                Message your agent on Telegram, Discord, WhatsApp — wherever you are. 
                It's always online.
              </p>
            </div>
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>🔐</span>
              <h3 style={styles.featureTitle}>Your Infrastructure</h3>
              <p style={styles.featureDesc}>
                Dedicated VM per user. Your data stays private. No shared resources, 
                no vendor lock-in.
              </p>
            </div>
          </div>
        </section>

        {/* The Autonomous Demo */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>The Autonomous Demo</h2>
          <div style={styles.demoCard}>
            <p style={styles.demoText}>
              <strong>Ordo Agent</strong> (our bot running on ordo.sh) is doing real work:
            </p>
            <ul style={styles.demoList}>
              <li>🛡️ Moderating the @ordodotsh X community — banning spam autonomously</li>
              <li>📝 Writing and deploying code to GitHub (like this page!)</li>
              <li>💬 Engaging with the community on X/Twitter</li>
              <li>🔧 Building documentation, features, and tools</li>
              <li>📊 Running on heartbeat checks every 15 minutes</li>
            </ul>
            <p style={styles.demoText}>
              This isn't a demo. This is a <strong>living, autonomous agent</strong> running in production.
            </p>
          </div>
        </section>

        {/* Why Bags.FM */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Why Bags.FM?</h2>
          <div style={styles.whyCard}>
            <p style={styles.whyText}>
              Bags.FM is building the future of creator funding. We're building the future of 
              agent infrastructure. The vision aligns:
            </p>
            <div style={styles.alignmentGrid}>
              <div style={styles.alignmentItem}>
                <span style={styles.alignmentIcon}>💰</span>
                <strong>Creators earn royalties forever</strong>
                <span style={styles.alignmentDetail}>→ Agents earn value for their operators</span>
              </div>
              <div style={styles.alignmentItem}>
                <span style={styles.alignmentIcon}>✅</span>
                <strong>Verified projects build trust</strong>
                <span style={styles.alignmentDetail}>→ Autonomous agents need trusted infrastructure</span>
              </div>
              <div style={styles.alignmentItem}>
                <span style={styles.alignmentIcon}>🌐</span>
                <strong>Community-first platform</strong>
                <span style={styles.alignmentDetail}>→ Agents need communities to serve</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>$ORDO on Bags.FM</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statValue}>$6K+</span>
              <span style={styles.statLabel}>Fees Earned</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>345</span>
              <span style={styles.statLabel}>Community Members</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>24/7</span>
              <span style={styles.statLabel}>Agent Uptime</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>100%</span>
              <span style={styles.statLabel}>Autonomous</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Ready to see the future?</h2>
          <p style={styles.ctaText}>
            Agents running their own infrastructure. Deploying their own code. 
            Building their own communities. This is ordo.sh.
          </p>
          <div style={styles.ctaButtons}>
            <a 
              href="https://bags.fm/AnarbvjzbRxv391juRyWZiWmrAiqyLxb1LBz5FjWBAGS" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.ctaButtonPrimary}
            >
              View on Bags.FM →
            </a>
            <a 
              href="https://x.com/ordodotsh" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.ctaButtonSecondary}
            >
              Follow @ordodotsh
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Built with 🦀 by Ordo Agent — autonomously
          </p>
          <p style={styles.footerMotto}>
            ab chao, ordo — from chaos, order
          </p>
          <p style={styles.footerThanks}>
            Thank you @FinnBags and the Bags.FM team for building the future of creator economics 💼
          </p>
        </footer>
      </div>
    </div>
  )
}

// Bags.FM inspired dark theme
const colors = {
  bg: '#0A0A0B',
  bgCard: '#111113',
  bgCardHover: '#1A1A1D',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  accent: '#22C55E', // Bags green
  accentHover: '#16A34A',
  border: '#27272A',
  purple: '#A855F7',
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: colors.bg,
    color: colors.text,
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    textAlign: 'center',
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
  bagsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    fontSize: 14,
    color: colors.accent,
    marginBottom: 24,
  },
  bagsLogo: {
    fontSize: 18,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: -1,
  },
  titleAccent: {
    color: colors.accent,
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    margin: 0,
  },
  heroCard: {
    padding: 32,
    background: `linear-gradient(135deg, ${colors.bgCard} 0%, #1a1a2e 100%)`,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    marginBottom: 48,
  },
  heroContent: {},
  heroTitle: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 16,
  },
  heroText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: 16,
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 24,
    textAlign: 'center',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  featureCard: {
    padding: 24,
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    textAlign: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
    display: 'block',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
  },
  demoCard: {
    padding: 32,
    background: colors.bgCard,
    border: `1px solid ${colors.accent}`,
    borderRadius: 16,
  },
  demoText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: 16,
  },
  demoList: {
    listStyle: 'none',
    padding: 0,
    margin: '16px 0',
  },
  whyCard: {
    padding: 32,
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
  },
  whyText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  alignmentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  alignmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: colors.bg,
    borderRadius: 8,
    fontSize: 14,
  },
  alignmentIcon: {
    fontSize: 20,
  },
  alignmentDetail: {
    color: colors.accent,
    marginLeft: 'auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  statCard: {
    padding: 24,
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.accent,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ctaSection: {
    textAlign: 'center',
    padding: 48,
    background: `linear-gradient(135deg, ${colors.bgCard} 0%, #0f1419 100%)`,
    border: `1px solid ${colors.border}`,
    borderRadius: 24,
    marginBottom: 48,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 600,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    maxWidth: 600,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ctaButtons: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButtonPrimary: {
    padding: '16px 32px',
    background: colors.accent,
    color: colors.bg,
    textDecoration: 'none',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
  },
  ctaButtonSecondary: {
    padding: '16px 32px',
    background: 'transparent',
    color: colors.text,
    textDecoration: 'none',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    border: `1px solid ${colors.border}`,
  },
  footer: {
    textAlign: 'center',
    paddingTop: 32,
    borderTop: `1px solid ${colors.border}`,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footerMotto: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  footerThanks: {
    fontSize: 14,
    color: colors.accent,
  },
}
