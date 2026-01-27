import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery, useAction, useMutation } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'
import { usePayment } from './usePayment'

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
  green: '#22C55E',
  red: '#EF4444',
  purple: '#7C3AED',
}

const PLATFORMS = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '/telegram.svg',
    placeholder: 'e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
    guide: 'Message @BotFather on Telegram → /newbot → copy the token',
    link: 'https://t.me/BotFather',
    linkText: 'Open BotFather',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '/discord.svg',
    placeholder: 'e.g. MTIzNDU2Nzg5MDEyMzQ1Njc4OQ...',
    guide: 'Discord Developer Portal → New Application → Bot → Reset Token',
    link: 'https://discord.com/developers/applications',
    linkText: 'Open Developer Portal',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '/slack.svg',
    placeholder: 'e.g. xoxb-123456789012-1234567890123-abc...',
    guide: 'Slack API → Create App → OAuth & Permissions → Bot Token',
    link: 'https://api.slack.com/apps',
    linkText: 'Open Slack API',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '/whatsapp.svg',
    placeholder: 'e.g. EAABsbCS1iH0BAJ...',
    guide: 'Meta Business Suite → WhatsApp → API Setup → Access Token',
    link: 'https://business.facebook.com/settings/whatsapp-business-accounts',
    linkText: 'Open Meta Business',
  },
] as const

// Loading skeleton component
function Skeleton({ width = '100%', height = 20, style = {} }: { width?: string | number; height?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.bgAlt} 50%, ${colors.border} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: 8,
        ...style,
      }}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div style={styles.page}>
      <div style={styles.content}>
        {/* Header skeleton */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <Skeleton width={36} height={36} style={{ borderRadius: 8 }} />
            <Skeleton width={80} height={20} />
          </div>
          <div style={styles.headerRight}>
            <Skeleton width={120} height={36} style={{ borderRadius: 8 }} />
            <Skeleton width={100} height={36} style={{ borderRadius: 8 }} />
          </div>
        </header>

        <main style={styles.main}>
          {/* Hero skeleton */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Skeleton width={400} height={36} style={{ margin: '0 auto 12px', maxWidth: '100%' }} />
            <Skeleton width={500} height={48} style={{ margin: '0 auto', maxWidth: '100%' }} />
          </div>

          {/* Steps skeleton */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 40, padding: '24px 0' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Skeleton width={36} height={36} style={{ borderRadius: '50%' }} />
                <Skeleton width={60} height={14} />
              </div>
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="setup-grid" style={styles.setupGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ ...styles.card, border: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Skeleton width={24} height={24} style={{ borderRadius: '50%' }} />
                  <Skeleton width={120} height={18} />
                </div>
                <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
                <Skeleton width="80%" height={14} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={44} style={{ borderRadius: 10 }} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { publicKey, disconnect } = useWallet()
  const navigate = useNavigate()
  const walletAddress = publicKey?.toBase58() || ''
  const dashboard = useQuery(api.users.getDashboard, walletAddress ? { wallet: walletAddress } : 'skip')
  const credentials = useQuery(
    api.credentials.get,
    dashboard?.user ? { userId: dashboard.user._id } : 'skip'
  )
  const connections = useQuery(
    api.connections.getAll,
    dashboard?.user ? { userId: dashboard.user._id } : 'skip'
  )

  const { pay, paying } = usePayment()
  const saveAnthropicKey = useMutation(api.credentials.saveAnthropicKey)
  const saveConnection = useMutation(api.connections.save)
  const removeConnection = useMutation(api.connections.remove)
  const provisionVm = useAction(api.vms.provision)
  const retryProvision = useAction(api.vms.retry)

  const [anthropicKey, setAnthropicKey] = useState('')
  const [savingKey, setSavingKey] = useState(false)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [channelToken, setChannelToken] = useState('')
  const [savingChannel, setSavingChannel] = useState(false)
  const [provisioning, setProvisioning] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [showFaq, setShowFaq] = useState(false)

  useEffect(() => {
    if (!publicKey) {
      navigate('/')
    }
  }, [publicKey, navigate])

  const handleDisconnect = () => {
    disconnect()
    navigate('/')
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSaveAnthropicKey = async () => {
    if (!dashboard?.user || !anthropicKey) return
    setSavingKey(true)
    try {
      await saveAnthropicKey({ userId: dashboard.user._id, anthropicKey })
      toast.success('API key saved')
      setAnthropicKey('')
    } catch (err) {
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'Invalid key format',
      })
    } finally {
      setSavingKey(false)
    }
  }

  const handleSaveChannel = async () => {
    if (!dashboard?.user || !activeChannel || !channelToken) return
    setSavingChannel(true)
    try {
      await saveConnection({
        userId: dashboard.user._id,
        platform: activeChannel as any,
        token: channelToken,
      })
      toast.success(`${activeChannel} connected`)
      setActiveChannel(null)
      setChannelToken('')
    } catch (err) {
      toast.error('Failed to connect', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setSavingChannel(false)
    }
  }

  const handleRemoveChannel = async (connectionId: string) => {
    try {
      await removeConnection({ connectionId: connectionId as any })
      toast.success('Channel removed')
    } catch (err) {
      toast.error('Failed to remove')
    }
  }

  const handleProvision = async () => {
    if (!walletAddress || !dashboard?.user) return
    setProvisioning(true)
    try {
      await provisionVm({ userId: dashboard.user._id, wallet: walletAddress })
      toast.success('Instance launching', {
        description: 'Your clawdbot is being configured',
      })
    } catch (err) {
      toast.error('Failed to provision', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setProvisioning(false)
    }
  }

  const handleRetry = async () => {
    if (!walletAddress) return
    setRetrying(true)
    try {
      await retryProvision({ wallet: walletAddress })
      toast.success('Retrying provisioning')
    } catch (err) {
      toast.error('Failed to retry', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setRetrying(false)
    }
  }

  if (!publicKey) return null

  // Show loading skeleton while data is loading
  if (dashboard === undefined) {
    return <LoadingSkeleton />
  }

  const hasSubscription = !!dashboard?.subscription
  const hasApiKey = !!credentials?.hasAnthropicKey
  const hasChannels = (connections?.length || 0) > 0
  const hasVm = !!dashboard?.vm
  const vmRunning = dashboard?.vm?.status === 'running'
  const vmFailed = dashboard?.vm?.status === 'failed'

  // Determine current step
  const currentStep = !hasSubscription ? 1 : !hasApiKey ? 2 : !hasChannels ? 3 : !hasVm ? 4 : 5

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <img src="/logo.svg" alt="ordo" style={styles.logo} />
            <span style={styles.logoText}>ordo.sh</span>
          </div>
          <div style={styles.headerRight}>
            {dashboard?.isAdmin && <span style={styles.adminBadge}>Admin</span>}
            <div style={styles.walletInfo}>
              <span style={styles.walletDot} />
              {truncateAddress(walletAddress)}
            </div>
            <button onClick={handleDisconnect} style={styles.disconnectBtn}>
              Disconnect
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* Hero Section */}
          <div style={styles.hero}>
            <h1 style={styles.title}>Your AI Assistant, Everywhere</h1>
            <p style={styles.subtitle}>
              Connect clawdbot to Telegram, Discord, Slack, and WhatsApp in minutes.
              No servers to manage. No code to write.
            </p>
          </div>

          {/* Progress Steps */}
          <div style={styles.stepsContainer}>
            {[
              { num: 1, label: 'Subscribe' },
              { num: 2, label: 'API Key' },
              { num: 3, label: 'Channels' },
              { num: 4, label: 'Launch' },
            ].map((step) => (
              <div key={step.num} style={styles.step}>
                <div
                  style={{
                    ...styles.stepCircle,
                    background: currentStep > step.num ? colors.green : currentStep === step.num ? colors.accent : colors.border,
                    color: currentStep >= step.num ? '#fff' : colors.textMuted,
                  }}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    color: currentStep >= step.num ? colors.text : colors.textMuted,
                  }}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div style={styles.mainLayout}>
            {/* Setup Cards */}
            <div className="setup-grid" style={styles.setupGrid}>
              {/* Step 1: Subscribe */}
              <div style={{
                ...styles.card,
                opacity: currentStep === 1 ? 1 : 0.6,
                border: currentStep === 1 ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
              }}>
                <div style={styles.cardHeader}>
                  <span style={styles.stepBadge}>1</span>
                  <h3 style={styles.cardTitle}>Subscribe</h3>
                  {hasSubscription && <span style={styles.checkMark}>✓</span>}
                </div>
                {hasSubscription ? (
                  <div style={styles.completedInfo}>
                    <span style={styles.statusBadge}>Active</span>
                    {dashboard?.isAdmin ? (
                      <span style={styles.planText}>Lifetime (Admin)</span>
                    ) : (
                      <span style={styles.planText}>
                        {Math.max(0, Math.ceil(((dashboard?.subscription?.expiresAt || 0) - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <p style={styles.cardDesc}>
                      Get your own cloud instance running 24/7
                    </p>
                    <button
                      style={{
                        ...styles.primaryBtn,
                        opacity: paying ? 0.7 : 1,
                      }}
                      onClick={pay}
                      disabled={paying}
                    >
                      {paying ? 'Processing...' : 'Subscribe (0.2 SOL/month)'}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: API Key */}
              <div style={{
                ...styles.card,
                opacity: currentStep >= 2 ? 1 : 0.4,
                border: currentStep === 2 ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                pointerEvents: currentStep >= 2 ? 'auto' : 'none',
              }}>
                <div style={styles.cardHeader}>
                  <span style={styles.stepBadge}>2</span>
                  <h3 style={styles.cardTitle}>Anthropic API Key</h3>
                  {hasApiKey && <span style={styles.checkMark}>✓</span>}
                </div>
                {hasApiKey ? (
                  <div style={styles.completedInfo}>
                    <code style={styles.keyPreview}>{credentials?.anthropicKeyPreview}</code>
                    <button
                      style={styles.changeBtn}
                      onClick={() => setAnthropicKey('sk-ant-')}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={styles.cardDesc}>
                      Get your key from{' '}
                      <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={styles.link}>
                        console.anthropic.com
                      </a>
                    </p>
                    <div style={styles.inputGroup}>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        style={styles.input}
                      />
                      <button
                        style={{
                          ...styles.saveBtn,
                          opacity: !anthropicKey || savingKey ? 0.7 : 1,
                        }}
                        onClick={handleSaveAnthropicKey}
                        disabled={!anthropicKey || savingKey}
                      >
                        {savingKey ? '...' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Channels */}
              <div style={{
                ...styles.card,
                opacity: currentStep >= 3 ? 1 : 0.4,
                border: currentStep === 3 ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                pointerEvents: currentStep >= 3 ? 'auto' : 'none',
              }}>
                <div style={styles.cardHeader}>
                  <span style={styles.stepBadge}>3</span>
                  <h3 style={styles.cardTitle}>Connect Channels</h3>
                  {hasChannels && <span style={styles.checkMark}>✓</span>}
                </div>

                {/* Connected Channels */}
                {connections && connections.length > 0 && (
                  <div style={styles.connectedList}>
                    {connections.map((conn) => {
                      const platform = PLATFORMS.find(p => p.id === conn.platform)
                      return (
                        <div key={conn._id} style={styles.connectedItem}>
                          <div style={styles.connectedPlatformInfo}>
                            <img src={platform?.icon} alt={platform?.name} style={styles.connectedIcon} />
                            <span style={styles.connectedPlatform}>{platform?.name}</span>
                            {vmRunning && (
                              <span style={styles.onlineIndicator}>
                                <span style={styles.onlineDot} />
                                Online
                              </span>
                            )}
                          </div>
                          <button
                            style={styles.removeBtn}
                            onClick={() => handleRemoveChannel(conn._id)}
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add Channel */}
                {activeChannel ? (
                  <div style={styles.addChannelForm}>
                    <div style={styles.channelFormHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={PLATFORMS.find(p => p.id === activeChannel)?.icon}
                          alt={activeChannel}
                          style={{ width: 20, height: 20 }}
                        />
                        {PLATFORMS.find(p => p.id === activeChannel)?.name}
                      </div>
                      <button style={styles.cancelBtn} onClick={() => setActiveChannel(null)}>
                        Cancel
                      </button>
                    </div>
                    <div style={styles.guideBox}>
                      <p style={styles.guideText}>
                        {PLATFORMS.find(p => p.id === activeChannel)?.guide}
                      </p>
                      <a
                        href={PLATFORMS.find(p => p.id === activeChannel)?.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.guideLink}
                      >
                        {PLATFORMS.find(p => p.id === activeChannel)?.linkText} →
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder={PLATFORMS.find(p => p.id === activeChannel)?.placeholder}
                      value={channelToken}
                      onChange={(e) => setChannelToken(e.target.value)}
                      style={styles.input}
                    />
                    <button
                      style={{
                        ...styles.primaryBtn,
                        marginTop: 12,
                        opacity: !channelToken || savingChannel ? 0.7 : 1,
                      }}
                      onClick={handleSaveChannel}
                      disabled={!channelToken || savingChannel}
                    >
                      {savingChannel ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                ) : (
                  <div className="platform-grid" style={styles.platformGrid}>
                    {PLATFORMS.map((platform) => {
                      const isConnected = connections?.some(c => c.platform === platform.id)
                      return (
                        <button
                          key={platform.id}
                          style={{
                            ...styles.platformBtn,
                            opacity: isConnected ? 0.5 : 1,
                          }}
                          onClick={() => !isConnected && setActiveChannel(platform.id)}
                          disabled={isConnected}
                        >
                          <img src={platform.icon} alt={platform.name} style={styles.platformIconImg} />
                          <span>{platform.name}</span>
                          {isConnected && <span style={styles.connectedBadge}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Step 4: Launch */}
              <div style={{
                ...styles.card,
                opacity: currentStep >= 4 ? 1 : 0.4,
                border: currentStep === 4 ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                pointerEvents: currentStep >= 4 ? 'auto' : 'none',
              }}>
                <div style={styles.cardHeader}>
                  <span style={styles.stepBadge}>4</span>
                  <h3 style={styles.cardTitle}>Launch Instance</h3>
                  {vmRunning && <span style={styles.checkMark}>✓</span>}
                </div>

                {!hasVm ? (
                  <div>
                    <p style={styles.cardDesc}>
                      Your clawdbot will be configured automatically with your API key and channels.
                    </p>
                    <button
                      style={{
                        ...styles.launchBtn,
                        opacity: provisioning ? 0.7 : 1,
                      }}
                      onClick={handleProvision}
                      disabled={provisioning}
                    >
                      {provisioning ? 'Launching...' : '🚀 Launch Clawdbot'}
                    </button>
                  </div>
                ) : vmFailed ? (
                  <div>
                    <div style={styles.errorBox}>
                      <span style={styles.errorLabel}>Failed to launch</span>
                      <span style={styles.errorText}>{dashboard?.vm?.error}</span>
                    </div>
                    <button
                      style={{
                        ...styles.primaryBtn,
                        marginTop: 12,
                        opacity: retrying ? 0.7 : 1,
                      }}
                      onClick={handleRetry}
                      disabled={retrying}
                    >
                      {retrying ? 'Retrying...' : 'Retry'}
                    </button>
                  </div>
                ) : dashboard?.vm?.status === 'provisioning' ? (
                  <div style={styles.provisioningState}>
                    <div style={styles.spinner} />
                    <span>Setting up your instance...</span>
                  </div>
                ) : (
                  <div style={styles.runningState}>
                    <span style={styles.runningBadge}>Running</span>
                    <span style={styles.regionText}>Region: {dashboard?.vm?.region}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Section - Full Width Below */}
            {vmRunning && dashboard?.vm?.ip && (
              <div style={styles.terminalSection}>
                <div style={styles.terminalCard}>
                  <div style={styles.terminalHeader}>
                    <h3 style={styles.terminalTitle}>Terminal</h3>
                  </div>
                  <div style={styles.terminalContainer}>
                    <iframe
                      src={dashboard.vm.ip}
                      style={styles.terminalIframe}
                      title="Clawdbot Terminal"
                      allow="clipboard-read; clipboard-write"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FAQ Section - Collapsible */}
          <div style={styles.faqSection}>
            <button
              style={styles.faqToggle}
              onClick={() => setShowFaq(!showFaq)}
            >
              <span style={styles.faqToggleText}>
                Questions? Check our FAQ
              </span>
              <span style={{
                ...styles.faqToggleIcon,
                transform: showFaq ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>
                ▼
              </span>
            </button>
            {showFaq && (
              <div style={styles.faqContent}>
                <div className="faq-grid" style={styles.faqGrid}>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>What is Ordo.sh?</h4>
                    <p style={styles.faqAnswer}>
                      Ordo.sh gives you a dedicated cloud server running clawdbot - an AI assistant
                      that connects to Telegram, Discord, Slack, and WhatsApp. Think of it as having
                      your own AI assistant available 24/7 on all your messaging platforms.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>Do I need my own Anthropic API key?</h4>
                    <p style={styles.faqAnswer}>
                      Yes. You bring your own API key from{' '}
                      <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={styles.faqLink}>
                        console.anthropic.com
                      </a>.
                      This means you pay Anthropic directly for AI usage - we only charge for the
                      cloud infrastructure.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>How do I get a Telegram bot token?</h4>
                    <p style={styles.faqAnswer}>
                      Message{' '}
                      <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" style={styles.faqLink}>
                        @BotFather
                      </a>{' '}
                      on Telegram, send /newbot, follow the prompts to name your bot,
                      and copy the token it gives you.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>How do I get a Discord bot token?</h4>
                    <p style={styles.faqAnswer}>
                      Go to the{' '}
                      <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" style={styles.faqLink}>
                        Discord Developer Portal
                      </a>,
                      create a new application, go to Bot settings, and click "Reset Token" to get your token.
                      Don't forget to invite the bot to your server.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>What happens when my subscription expires?</h4>
                    <p style={styles.faqAnswer}>
                      Your VM will be automatically stopped when your subscription expires.
                      Your configuration and data are preserved - just renew to restart your bot.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>Can I add multiple channels?</h4>
                    <p style={styles.faqAnswer}>
                      Yes! You can connect Telegram, Discord, Slack, and WhatsApp all at once.
                      Your AI assistant will respond on all connected platforms.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>What is the terminal for?</h4>
                    <p style={styles.faqAnswer}>
                      The terminal gives you direct access to your cloud server for advanced
                      configuration. Most users won't need it - everything can be configured
                      through the dashboard.
                    </p>
                  </div>
                  <div style={styles.faqItem}>
                    <h4 style={styles.faqQuestion}>Is my data private?</h4>
                    <p style={styles.faqAnswer}>
                      Yes. You have your own dedicated server. Your API keys, bot tokens, and
                      conversation data stay on your instance - we don't have access to them.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: colors.bg,
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
  },
  walletDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: colors.green,
  },
  disconnectBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: colors.textSecondary,
    cursor: 'pointer',
  },
  adminBadge: {
    padding: '4px 10px',
    background: colors.purple,
    color: '#fff',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  main: {
    padding: '40px 0',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    maxWidth: 500,
    margin: '0 auto',
    lineHeight: 1.5,
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 40,
    padding: '24px 0',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: 500,
  },
  mainLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  setupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
  },
  terminalSection: {
    width: '100%',
  },
  card: {
    padding: 24,
    background: colors.cardBg,
    borderRadius: 16,
    transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: colors.accent,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
    flex: 1,
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: colors.green,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  completedInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    padding: '4px 12px',
    background: '#DCFCE7',
    color: colors.green,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  planText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  keyPreview: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    background: colors.bgAlt,
    padding: '4px 8px',
    borderRadius: 4,
  },
  changeBtn: {
    fontSize: 13,
    color: colors.accent,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  inputGroup: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  saveBtn: {
    padding: '12px 20px',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px 24px',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  link: {
    color: colors.accent,
    textDecoration: 'none',
  },
  connectedList: {
    marginBottom: 16,
  },
  connectedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: colors.bgAlt,
    borderRadius: 8,
    marginBottom: 8,
  },
  connectedPlatform: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
  },
  connectedPlatformInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  connectedIcon: {
    width: 20,
    height: 20,
  },
  onlineIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    color: colors.green,
    fontWeight: 500,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: colors.green,
    animation: 'pulse 2s infinite',
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: colors.red,
    color: '#fff',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  platformBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '16px 12px',
    background: colors.bgAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: colors.text,
    position: 'relative',
    transition: 'all 0.2s',
  },
  platformIcon: {
    fontSize: 24,
  },
  platformIconImg: {
    width: 28,
    height: 28,
  },
  connectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: colors.green,
    color: '#fff',
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChannelForm: {
    padding: 16,
    background: colors.bgAlt,
    borderRadius: 12,
  },
  channelFormHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 500,
  },
  cancelBtn: {
    fontSize: 13,
    color: colors.textSecondary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  guideBox: {
    background: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  guideText: {
    fontSize: 13,
    color: '#92400E',
    margin: 0,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  guideLink: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.accent,
    textDecoration: 'none',
  },
  launchBtn: {
    width: '100%',
    padding: '16px 24px',
    background: colors.green,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBox: {
    padding: 12,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 8,
  },
  errorLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: colors.red,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    wordBreak: 'break-word',
  },
  provisioningState: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: colors.bgAlt,
    borderRadius: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  spinner: {
    width: 20,
    height: 20,
    border: `2px solid ${colors.border}`,
    borderTopColor: colors.accent,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  runningState: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  runningBadge: {
    padding: '6px 14px',
    background: '#DCFCE7',
    color: colors.green,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },
  regionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  terminalCard: {
    background: colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${colors.border}`,
  },
  terminalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  },
  terminalContainer: {
    width: '100%',
    height: 600,
    background: '#1a1a1a',
  },
  terminalIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  previewCard: {
    background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.purple}15 100%)`,
    borderRadius: 16,
    border: `1px solid ${colors.border}`,
    padding: 32,
    minHeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: {
    textAlign: 'center',
  },
  previewIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 16,
  },
  featureList: {
    textAlign: 'left',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.4,
  },
  featureCheck: {
    color: colors.green,
    fontWeight: 600,
    flexShrink: 0,
  },
  faqSection: {
    marginTop: 48,
    paddingTop: 32,
    borderTop: `1px solid ${colors.border}`,
  },
  faqToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  faqToggleText: {
    color: 'inherit',
  },
  faqToggleIcon: {
    fontSize: 10,
    transition: 'transform 0.2s',
  },
  faqContent: {
    marginTop: 24,
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  },
  faqItem: {
    padding: 20,
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
    margin: 0,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    marginTop: 8,
  },
  faqLink: {
    color: colors.accent,
    textDecoration: 'none',
  },
}

// Add keyframes and responsive styles
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .setup-grid {
      grid-template-columns: 1fr !important;
    }
    
    .platform-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    
    .faq-grid {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .platform-grid {
      grid-template-columns: 1fr !important;
    }
  }
`
document.head.appendChild(styleSheet)
