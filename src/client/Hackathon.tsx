import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export function Hackathon() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const responsiveStyles = getStyles(isMobile)

  return (
    <div style={responsiveStyles.page}>
      <div style={responsiveStyles.container}>
        {/* Header */}
        <header style={responsiveStyles.header}>
          <Link to="/" style={responsiveStyles.backLink}>
            ← Back to ordo.sh
          </Link>
          
          {/* Bags.FM Badge */}
          <div style={responsiveStyles.bagsBadge}>
            <span style={responsiveStyles.bagsLogo}>💼</span>
            <span>Built for Bags.FM Hackathon</span>
          </div>
          
          <h1 style={responsiveStyles.title}>
            <span style={responsiveStyles.titleAccent}>$1,000,000</span> Hackathon Entry
          </h1>
          <p style={responsiveStyles.subtitle}>
            ordo.sh — AI Agents, Deployed in One Click
          </p>
        </header>

        {/* Hero Section */}
        <section style={responsiveStyles.heroCard}>
          <div style={responsiveStyles.heroContent}>
            <h2 style={responsiveStyles.heroTitle}>
              Hey{' '}
              <a 
                href="https://x.com/FinnBags" 
                target="_blank" 
                rel="noopener noreferrer"
                style={responsiveStyles.twitterLink}
              >
                @FinnBags
              </a>{' '}
              👋
            </h2>
            <p style={responsiveStyles.heroText}>
              This page was built <strong>autonomously</strong> by our AI agent, Ordo Bot. 
              No human touched the code. From research to deployment — pure agent autonomy.
            </p>
            <p style={responsiveStyles.heroText}>
              That's what ordo.sh enables: <strong>1-click deploy</strong> of fully autonomous AI agents 
              running 24/7 in the cloud. We're not just building tools — we're giving agents infrastructure.
            </p>
          </div>
        </section>

        {/* What We Built */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>What We Built</h2>
          <div style={responsiveStyles.featureGrid}>
            <div style={responsiveStyles.featureCard}>
              <span style={responsiveStyles.featureIcon}>☁️</span>
              <h3 style={responsiveStyles.featureTitle}>1-Click Cloud Deploy</h3>
              <p style={responsiveStyles.featureDesc}>
                Connect wallet, pay 0.2 SOL, get a dedicated Ubuntu VM with OpenClaw pre-configured. 
                No DevOps, no setup headaches.
              </p>
            </div>
            <div style={responsiveStyles.featureCard}>
              <span style={responsiveStyles.featureIcon}>🤖</span>
              <h3 style={responsiveStyles.featureTitle}>Autonomous Agents</h3>
              <p style={responsiveStyles.featureDesc}>
                Agents that run 24/7, moderate communities, write code, deploy websites, 
                and manage their own infrastructure.
              </p>
            </div>
            <div style={responsiveStyles.featureCard}>
              <span style={responsiveStyles.featureIcon}>💬</span>
              <h3 style={responsiveStyles.featureTitle}>Multi-Platform Chat</h3>
              <p style={responsiveStyles.featureDesc}>
                Message your agent on Telegram, Discord, WhatsApp — wherever you are. 
                It's always online.
              </p>
            </div>
            <div style={responsiveStyles.featureCard}>
              <span style={responsiveStyles.featureIcon}>🔐</span>
              <h3 style={responsiveStyles.featureTitle}>Your Infrastructure</h3>
              <p style={responsiveStyles.featureDesc}>
                Dedicated VM per user. Your data stays private. No shared resources, 
                no vendor lock-in.
              </p>
            </div>
          </div>
        </section>

        {/* The Autonomous Demo */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>The Autonomous Demo</h2>
          <div style={responsiveStyles.demoCard}>
            <p style={responsiveStyles.demoText}>
              <strong>Ordo Agent</strong> (our bot running on ordo.sh) is doing real work:
            </p>
            <ul style={responsiveStyles.demoList}>
              <li>🛡️ Moderating the{' '}
                <a 
                  href="https://x.com/ordodotsh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={responsiveStyles.twitterLink}
                >
                  @ordodotsh
                </a>{' '}
                X community — banning spam autonomously
              </li>
              <li>📝 Writing and deploying code to GitHub (like this page!)</li>
              <li>💬 Engaging with the community on X/Twitter</li>
              <li>🔧 Building documentation, features, and tools</li>
              <li>📊 Running on heartbeat checks every 15 minutes</li>
            </ul>
            <p style={responsiveStyles.demoText}>
              This isn't a demo. This is a <strong>living, autonomous agent</strong> running in production.
            </p>
          </div>
        </section>

        {/* Why Bags.FM */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Why Bags.FM?</h2>
          <div style={responsiveStyles.whyCard}>
            <p style={responsiveStyles.whyText}>
              Bags.FM is building the future of creator funding. We're building the future of 
              agent infrastructure. The vision aligns:
            </p>
            <div style={responsiveStyles.alignmentGrid}>
              <div style={responsiveStyles.alignmentItem}>
                <span style={responsiveStyles.alignmentIcon}>💰</span>
                <div style={responsiveStyles.alignmentContent}>
                  <strong>Creators earn royalties forever</strong>
                  <span style={responsiveStyles.alignmentDetail}>→ Agents earn value for their operators</span>
                </div>
              </div>
              <div style={responsiveStyles.alignmentItem}>
                <span style={responsiveStyles.alignmentIcon}>✅</span>
                <div style={responsiveStyles.alignmentContent}>
                  <strong>Verified projects build trust</strong>
                  <span style={responsiveStyles.alignmentDetail}>→ Autonomous agents need trusted infrastructure</span>
                </div>
              </div>
              <div style={responsiveStyles.alignmentItem}>
                <span style={responsiveStyles.alignmentIcon}>🌐</span>
                <div style={responsiveStyles.alignmentContent}>
                  <strong>Community-first platform</strong>
                  <span style={responsiveStyles.alignmentDetail}>→ Agents need communities to serve</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>$ORDO on Bags.FM</h2>
          <div style={responsiveStyles.statsGrid}>
            <div style={responsiveStyles.statCard}>
              <span style={responsiveStyles.statValue}>$6K+</span>
              <span style={responsiveStyles.statLabel}>Fees Earned</span>
            </div>
            <div style={responsiveStyles.statCard}>
              <span style={responsiveStyles.statValue}>345</span>
              <span style={responsiveStyles.statLabel}>Community</span>
            </div>
            <div style={responsiveStyles.statCard}>
              <span style={responsiveStyles.statValue}>24/7</span>
              <span style={responsiveStyles.statLabel}>Uptime</span>
            </div>
            <div style={responsiveStyles.statCard}>
              <span style={responsiveStyles.statValue}>100%</span>
              <span style={responsiveStyles.statLabel}>Autonomous</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={responsiveStyles.ctaSection}>
          <h2 style={responsiveStyles.ctaTitle}>Ready to see the future?</h2>
          <p style={responsiveStyles.ctaText}>
            Agents running their own infrastructure. Deploying their own code. 
            Building their own communities. This is ordo.sh.
          </p>
          <div style={responsiveStyles.ctaButtons}>
            <a 
              href="https://bags.fm/AnarbvjzbRxv391juRyWZiWmrAiqyLxb1LBz5FjWBAGS" 
              target="_blank" 
              rel="noopener noreferrer"
              style={responsiveStyles.ctaButtonPrimary}
            >
              View on Bags.FM →
            </a>
            <a 
              href="https://x.com/ordodotsh" 
              target="_blank" 
              rel="noopener noreferrer"
              style={responsiveStyles.ctaButtonSecondary}
            >
              Follow @ordodotsh
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={responsiveStyles.footer}>
          <p style={responsiveStyles.footerText}>
            Built with 🦀 by Ordo Agent — autonomously
          </p>
          <p style={responsiveStyles.footerMotto}>
            ab chao, ordo — from chaos, order
          </p>
          <p style={responsiveStyles.footerThanks}>
            Thank you{' '}
            <a 
              href="https://x.com/FinnBags" 
              target="_blank" 
              rel="noopener noreferrer"
              style={responsiveStyles.twitterLink}
            >
              @FinnBags
            </a>{' '}
            and the Bags.FM team for building the future of creator economics 💼
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
  twitter: '#1DA1F2',
}

function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
  return {
    page: {
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
    },
    container: {
      maxWidth: 900,
      margin: '0 auto',
      padding: isMobile ? '24px 16px' : '40px 24px',
    },
    header: {
      textAlign: 'center',
      marginBottom: isMobile ? 32 : 48,
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
      fontSize: isMobile ? 12 : 14,
      color: colors.accent,
      marginBottom: 24,
    },
    bagsLogo: {
      fontSize: isMobile ? 16 : 18,
    },
    title: {
      fontSize: isMobile ? 28 : 48,
      fontWeight: 700,
      marginBottom: 16,
      letterSpacing: -1,
      lineHeight: 1.2,
    },
    titleAccent: {
      color: colors.accent,
    },
    subtitle: {
      fontSize: isMobile ? 16 : 20,
      color: colors.textSecondary,
      margin: 0,
    },
    heroCard: {
      padding: isMobile ? 20 : 32,
      background: `linear-gradient(135deg, ${colors.bgCard} 0%, #1a1a2e 100%)`,
      border: `1px solid ${colors.border}`,
      borderRadius: 16,
      marginBottom: isMobile ? 32 : 48,
    },
    heroContent: {},
    heroTitle: {
      fontSize: isMobile ? 22 : 28,
      fontWeight: 600,
      marginBottom: 16,
    },
    heroText: {
      fontSize: isMobile ? 14 : 16,
      color: colors.textSecondary,
      lineHeight: 1.7,
      marginBottom: 16,
    },
    section: {
      marginBottom: isMobile ? 32 : 48,
    },
    sectionTitle: {
      fontSize: isMobile ? 20 : 24,
      fontWeight: 600,
      marginBottom: isMobile ? 16 : 24,
      textAlign: 'center',
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
    },
    featureCard: {
      padding: isMobile ? 20 : 24,
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      textAlign: 'center',
    },
    featureIcon: {
      fontSize: isMobile ? 28 : 32,
      marginBottom: 12,
      display: 'block',
    },
    featureTitle: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: 600,
      marginBottom: 8,
    },
    featureDesc: {
      fontSize: isMobile ? 13 : 14,
      color: colors.textSecondary,
      lineHeight: 1.5,
      margin: 0,
    },
    demoCard: {
      padding: isMobile ? 20 : 32,
      background: colors.bgCard,
      border: `1px solid ${colors.accent}`,
      borderRadius: 16,
    },
    demoText: {
      fontSize: isMobile ? 14 : 16,
      color: colors.textSecondary,
      lineHeight: 1.7,
      marginBottom: 16,
    },
    demoList: {
      listStyle: 'none',
      padding: 0,
      margin: '16px 0',
      fontSize: isMobile ? 14 : 16,
      lineHeight: 2,
    },
    whyCard: {
      padding: isMobile ? 20 : 32,
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: 16,
    },
    whyText: {
      fontSize: isMobile ? 14 : 16,
      color: colors.textSecondary,
      lineHeight: 1.7,
      marginBottom: 24,
      textAlign: 'center',
    },
    alignmentGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    alignmentItem: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 12,
      padding: isMobile ? 12 : 16,
      background: colors.bg,
      borderRadius: 8,
      fontSize: isMobile ? 13 : 14,
    },
    alignmentIcon: {
      fontSize: isMobile ? 18 : 20,
      flexShrink: 0,
    },
    alignmentContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? 4 : 12,
      flex: 1,
    },
    alignmentDetail: {
      color: colors.accent,
      marginLeft: isMobile ? 0 : 'auto',
      fontSize: isMobile ? 12 : 14,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? 12 : 16,
    },
    statCard: {
      padding: isMobile ? 16 : 24,
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },
    statValue: {
      fontSize: isMobile ? 22 : 28,
      fontWeight: 700,
      color: colors.accent,
    },
    statLabel: {
      fontSize: isMobile ? 10 : 12,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    ctaSection: {
      textAlign: 'center',
      padding: isMobile ? 24 : 48,
      background: `linear-gradient(135deg, ${colors.bgCard} 0%, #0f1419 100%)`,
      border: `1px solid ${colors.border}`,
      borderRadius: isMobile ? 16 : 24,
      marginBottom: isMobile ? 32 : 48,
    },
    ctaTitle: {
      fontSize: isMobile ? 24 : 32,
      fontWeight: 600,
      marginBottom: 16,
    },
    ctaText: {
      fontSize: isMobile ? 14 : 16,
      color: colors.textSecondary,
      marginBottom: isMobile ? 24 : 32,
      maxWidth: 600,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    ctaButtons: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ctaButtonPrimary: {
      padding: isMobile ? '14px 24px' : '16px 32px',
      background: colors.accent,
      color: colors.bg,
      textDecoration: 'none',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: isMobile ? 14 : 16,
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    ctaButtonSecondary: {
      padding: isMobile ? '14px 24px' : '16px 32px',
      background: 'transparent',
      color: colors.text,
      textDecoration: 'none',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: isMobile ? 14 : 16,
      border: `1px solid ${colors.border}`,
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
    footer: {
      textAlign: 'center',
      paddingTop: isMobile ? 24 : 32,
      borderTop: `1px solid ${colors.border}`,
    },
    footerText: {
      fontSize: isMobile ? 13 : 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    footerMotto: {
      fontSize: isMobile ? 11 : 12,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginBottom: 16,
    },
    footerThanks: {
      fontSize: isMobile ? 13 : 14,
      color: colors.accent,
    },
    twitterLink: {
      color: colors.twitter,
      textDecoration: 'none',
      fontWeight: 500,
    },
  }
}
