import { useState } from 'react'
import Lottie from 'lottie-react'
import catAnimation from '../assets/cat_playing.json'
import rocketAnimation from '../assets/rocket_go.json'
import { WalletButton } from './WalletButton'

const platforms = [
  { name: 'Telegram', icon: '/telegram.svg', color: '#0088cc' },
  { name: 'Discord', icon: '/discord.svg', color: '#5865F2' },
  { name: 'WhatsApp', icon: '/whatsapp.svg', color: '#25D366' },
  { name: 'Slack', icon: '/slack.svg', color: '#4A154B' },
]

const features = [
  {
    icon: '🧠',
    title: 'Persistent Memory',
    desc: 'Remembers your preferences, past conversations, and context. Gets smarter over time.',
  },
  {
    icon: '🌐',
    title: 'Browse & Research',
    desc: 'Searches the web, reads articles, fills forms, extracts data from any site.',
  },
  {
    icon: '📁',
    title: 'File Management',
    desc: 'Organize files, process documents, manage your digital workspace.',
  },
  {
    icon: '⚡',
    title: 'Automations',
    desc: 'Set up recurring tasks, reminders, and workflows that run automatically.',
  },
  {
    icon: '🔗',
    title: 'Integrations',
    desc: 'Connect to GitHub, Gmail, Notion, Calendar, and 50+ other services.',
  },
  {
    icon: '🔒',
    title: 'Your Own Instance',
    desc: 'Dedicated VM just for you. Your data stays private and secure.',
  },
]

const steps = [
  {
    num: '1',
    title: 'Connect Wallet',
    desc: 'Sign in with your Solana wallet. No email, no password.',
  },
  {
    num: '2',
    title: 'Pay 0.2 SOL',
    desc: 'Monthly subscription. Cancel anytime.',
  },
  {
    num: '3',
    title: 'Start Chatting',
    desc: 'Connect Telegram or Discord and start giving tasks.',
  },
]

export function App() {
  const [showCat, setShowCat] = useState(false)

  return (
    <div style={styles.page}>
      <div style={styles.content} className="content">
        {/* Hero */}
        <section style={styles.hero} className="hero">
          <img src="/logo.svg" alt="ordo" style={styles.logo} />
          <h2 style={styles.logoText}>ordo.sh</h2>
          <div
            style={styles.betaBadge}
            onClick={() => setShowCat(!showCat)}
          >
            <span style={styles.clickHint}>👆</span>
            Coming Soon
          </div>

          <div style={{ marginBottom: 24 }}>
            <WalletButton />
          </div>

          <h1 style={styles.headline} className="headline">
            Your personal AI assistant<br />
            <span style={styles.headlineAccent}>in the cloud</span>
          </h1>

          <p style={styles.motto}>ab chao, ordo</p>

          <p style={styles.subheadline} className="subheadline">
            Like having a Mac mini running an AI assistant 24/7 —<br />
            but we handle the hosting. Just connect and chat.
          </p>

          <Lottie animationData={rocketAnimation} style={styles.rocketLottie} className="rocket-lottie" loop />
          <a
            href="https://x.com/ordodotsh"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.xButton}
            className="x-button"
          >
            Follow on X for updates
          </a>
        </section>

        {/* Chat Platforms */}
        <section style={styles.section} className="section">
          <h2 style={styles.sectionTitle} className="section-title">Chat from anywhere</h2>
          <p style={styles.sectionSubtitle}>
            Message your AI assistant on your favorite platform
          </p>

          <div style={styles.platformsGrid} className="platforms-grid">
            {platforms.map((p) => (
              <div key={p.name} style={styles.platformCard} className="platform-card">
                <img src={p.icon} alt={p.name} style={styles.platformIcon} className="platform-icon" />
                <span style={{ ...styles.platformName, color: p.color }}>{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* The Problem / Solution */}
        <section style={styles.section} className="section">
          <div style={styles.problemSolution} className="problem-solution">
            <div style={styles.problemCard} className="problem-card">
              <h3 style={styles.problemTitle}>The Problem</h3>
              <p style={styles.problemText}>
                Running your own AI assistant requires a dedicated Mac mini or always-on laptop.
                That's $500+ in hardware, plus electricity, maintenance, and setup headaches.
              </p>
            </div>
            <div style={styles.arrowContainer} className="arrow-container">
              <span style={styles.arrow}>→</span>
            </div>
            <div style={styles.solutionCard} className="solution-card">
              <h3 style={styles.solutionTitle}>The Solution</h3>
              <p style={styles.solutionText}>
                Ordo gives you a dedicated cloud instance running 24/7.
                Same power, zero hardware. Connect your wallet and start chatting.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section style={styles.section} className="section">
          <h2 style={styles.sectionTitle} className="section-title">How it works</h2>
          <p style={styles.sectionSubtitle}>
            Up and running in under 2 minutes
          </p>

          <div style={styles.stepsGrid} className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} style={styles.stepCard} className="step-card">
                <div style={styles.stepNum}>{step.num}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={styles.section} className="section">
          <h2 style={styles.sectionTitle} className="section-title">What your Ordo can do</h2>
          <p style={styles.sectionSubtitle}>
            A full-time AI assistant that never sleeps
          </p>

          <div style={styles.featuresGrid} className="features-grid">
            {features.map((f) => (
              <div key={f.title} style={styles.featureCard} className="feature-card">
                <span style={styles.featureIcon}>{f.icon}</span>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Powered by */}
        <section style={styles.section} className="section">
          <div style={styles.poweredBy}>
            <p style={styles.poweredByText}>
              Powered by <span style={styles.highlight}>Clawdbot</span> — the open-source AI assistant with 30k+ GitHub stars
            </p>
            <a
              href="https://github.com/clawdbot/clawdbot"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.githubLink}
            >
              View on GitHub →
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section style={styles.section} className="section">
          <div style={styles.ctaCard} className="cta-card">
            <h2 style={styles.ctaTitle} className="section-title">Ready for your own AI assistant?</h2>
            <p style={styles.ctaSubtitle}>
              No hardware. No setup. Just chat.
            </p>
            <Lottie animationData={rocketAnimation} style={styles.rocketLottie} className="rocket-lottie" loop />
            <a
              href="https://x.com/ordodotsh"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.xButton}
              className="x-button"
            >
              Follow @ordodotsh
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <a
            href="https://bags.fm/AnarbvjzbRxv391juRyWZiWmrAiqyLxb1LBz5FjWBAGS"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.bagsLink}
          >
            <img src="/bags-icon.png" alt="Bags" style={styles.bagsIcon} />
            Built for Bags Hackathon
          </a>
          <div style={styles.footerLinks}>
            <a
              href="https://x.com/ordodotsh"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
            >
              @ordodotsh
            </a>
            <span style={styles.footerDot}>·</span>
            <a
              href="https://github.com/clawdbot/clawdbot"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.footerLink}
            >
              GitHub
            </a>
          </div>
          <p style={styles.footerMotto}>from chaos, order.</p>
        </footer>
      </div>

      {/* Easter egg modal */}
      {showCat && (
        <div style={styles.modalOverlay} onClick={() => setShowCat(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Lottie animationData={catAnimation} style={styles.catLottie} className="cat-lottie" loop />
            <p style={styles.modalText}>meow! come back soon</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Anthropic-inspired warm palette
const colors = {
  bg: '#FAF9F7',
  bgAlt: '#F5F4F1',
  text: '#1A1715',
  textSecondary: '#6B6560',
  textMuted: '#9A9590',
  accent: '#D97706',
  accentHover: '#B45309',
  border: '#E8E6E3',
  cardBg: '#FFFFFF',
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: colors.bg,
  },
  content: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '60px 24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 100,
  },
  logo: {
    width: 80,
    height: 'auto',
    marginBottom: 12,
    borderRadius: 16,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 600,
    color: colors.text,
    margin: '0 0 16px 0',
    letterSpacing: -0.5,
  },
  betaBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: 'fit-content',
    margin: '0 auto 24px auto',
    padding: '6px 16px',
    background: colors.bgAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  clickHint: {
    fontSize: 14,
    animation: 'bounce 1s ease infinite',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    cursor: 'pointer',
  },
  modalContent: {
    background: colors.cardBg,
    borderRadius: 24,
    padding: 32,
    textAlign: 'center',
    cursor: 'default',
  },
  catLottie: {
    width: 300,
    height: 300,
  },
  modalText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  xButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 32px',
    background: colors.text,
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  rocketLottie: {
    width: 200,
    height: 200,
    margin: '0 auto 16px auto',
  },
  headline: {
    fontSize: 48,
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1.2,
    marginBottom: 16,
    letterSpacing: -1,
  },
  headlineAccent: {
    color: colors.accent,
  },
  motto: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 16,
  },
  subheadline: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 1.6,
    marginBottom: 32,
  },
  section: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  platformsGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  platformCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '24px 32px',
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    minWidth: 120,
  },
  platformName: {
    fontSize: 14,
    fontWeight: 600,
  },
  platformIcon: {
    width: 40,
    height: 40,
  },
  problemSolution: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 24,
    alignItems: 'center',
  },
  problemCard: {
    padding: 32,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 16,
  },
  problemTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  problemText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  solutionCard: {
    padding: 32,
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: 16,
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  solutionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  stepCard: {
    textAlign: 'center',
    padding: 24,
  },
  stepNum: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: colors.accent,
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 20,
  },
  featureCard: {
    padding: 24,
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 12,
    display: 'block',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
  },
  poweredBy: {
    textAlign: 'center',
    padding: '32px',
    background: colors.bgAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
  },
  poweredByText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  highlight: {
    color: colors.text,
    fontWeight: 600,
  },
  githubLink: {
    color: colors.accent,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  },
  ctaCard: {
    textAlign: 'center',
    padding: '48px 32px',
    background: colors.bgAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 24,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  footer: {
    textAlign: 'center',
    paddingTop: 40,
    borderTop: `1px solid ${colors.border}`,
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  footerLink: {
    color: colors.textSecondary,
    textDecoration: 'none',
    fontSize: 14,
  },
  footerDot: {
    color: colors.textMuted,
  },
  footerMotto: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  bagsLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: colors.textMuted,
    textDecoration: 'none',
    marginBottom: 12,
  },
  bagsIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
}
