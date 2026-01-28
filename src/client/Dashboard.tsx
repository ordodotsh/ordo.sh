import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery, useAction, useMutation } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import Lottie from 'lottie-react'
import { api } from '../../convex/_generated/api'
import { usePayment } from './usePayment'
import catPlayingAnimation from '../assets/cat_playing.json'

const lightColors = {
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
  inputBg: '#FFFFFF',
  guideBoxBg: '#FEF3C7',
  guideBoxBorder: '#FCD34D',
  guideBoxText: '#92400E',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#991B1B',
  successBg: '#DCFCE7',
}

const darkColors = {
  bg: '#0F0F0F',
  bgAlt: '#1A1A1A',
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#707070',
  accent: '#F59E0B',
  accentHover: '#D97706',
  border: '#2A2A2A',
  cardBg: '#171717',
  green: '#22C55E',
  red: '#EF4444',
  purple: '#A78BFA',
  inputBg: '#1A1A1A',
  guideBoxBg: '#292524',
  guideBoxBorder: '#78716C',
  guideBoxText: '#FCD34D',
  errorBg: '#450A0A',
  errorBorder: '#7F1D1D',
  errorText: '#FCA5A5',
  successBg: '#14532D',
}

type Colors = typeof lightColors

const getColors = (isDark: boolean): Colors => isDark ? darkColors : lightColors

// For skeleton - use a default for initial render
let colors = lightColors

const PLATFORMS = [
  {
    id: 'telegram',
    name: 'Telegram Bot',
    icon: '/telegram.svg',
    placeholder: 'e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
    guide: 'Message @BotFather on Telegram → /newbot → copy the token',
    link: 'https://t.me/BotFather',
    linkText: 'Open BotFather',
    chatTip: 'Search for your bot username in Telegram and send a message!',
    getBotLink: (token: string) => {
      const botId = token.split(':')[0]
      return botId ? `https://t.me/bot${botId}` : null
    },
    hasConfig: false,
  },
  {
    id: 'telegram_user',
    name: 'Telegram Full',
    icon: '/telegram.svg',
    placeholder: 'Phone number (e.g. +1234567890)',
    guide: 'Full access to your Telegram account - read all chats, message anyone. Get API credentials from my.telegram.org',
    link: 'https://my.telegram.org/apps',
    linkText: 'Get API Credentials',
    chatTip: 'Your AI has full access to your Telegram account!',
    getBotLink: () => null,
    hasConfig: true,
    configFields: [
      { key: 'apiId', label: 'API ID', placeholder: 'e.g. 12345678' },
      { key: 'apiHash', label: 'API Hash', placeholder: 'e.g. 0123456789abcdef...' },
      { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +1234567890' },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '/discord.svg',
    placeholder: 'e.g. MTIzNDU2Nzg5MDEyMzQ1Njc4OQ...',
    guide: 'Discord Developer Portal → New Application → Bot → Reset Token',
    link: 'https://discord.com/developers/applications',
    linkText: 'Open Developer Portal',
    chatTip: 'Invite your bot to a server and mention it with @BotName',
    getBotLink: () => null,
    hasConfig: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '/slack.svg',
    placeholder: 'e.g. xoxb-123456789012-1234567890123-abc...',
    guide: 'Slack API → Create App → OAuth & Permissions → Bot Token',
    link: 'https://api.slack.com/apps',
    linkText: 'Open Slack API',
    chatTip: 'Install the app to your workspace and DM the bot',
    getBotLink: () => null,
    hasConfig: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '/whatsapp.svg',
    placeholder: 'e.g. EAABsbCS1iH0BAJ...',
    guide: 'Meta Business Suite → WhatsApp → API Setup → Access Token',
    link: 'https://business.facebook.com/settings/whatsapp-business-accounts',
    linkText: 'Open Meta Business',
    chatTip: 'Send a message to your WhatsApp Business number',
    getBotLink: () => null,
    hasConfig: false,
  },
  {
    id: 'email',
    name: 'Email',
    icon: '/telegram.svg', // TODO: add email icon
    placeholder: 'Email password or app password',
    guide: 'Connect your email to read and send messages. Use an app password for Gmail/Outlook.',
    link: 'https://myaccount.google.com/apppasswords',
    linkText: 'Get App Password (Gmail)',
    chatTip: 'Your AI can read and send emails on your behalf!',
    getBotLink: () => null,
    hasConfig: true,
    configFields: [
      { key: 'imapHost', label: 'IMAP Server', placeholder: 'e.g. imap.gmail.com' },
      { key: 'smtpHost', label: 'SMTP Server', placeholder: 'e.g. smtp.gmail.com' },
      { key: 'imapUser', label: 'Email Address', placeholder: 'e.g. you@gmail.com' },
    ],
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
  const saveOpenaiKey = useMutation(api.credentials.saveOpenaiKey)
  const saveGoogleKey = useMutation(api.credentials.saveGoogleKey)
  const saveConnection = useMutation(api.connections.save)
  const removeConnection = useMutation(api.connections.remove)
  const provisionVm = useAction(api.vms.provision)
  const retryProvision = useAction(api.vms.retry)

  const [anthropicKey, setAnthropicKey] = useState('')
  const [openaiKey, setOpenaiKey] = useState('')
  const [googleKey, setGoogleKey] = useState('')
  const [savingKey, setSavingKey] = useState<string | false>(false)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [channelToken, setChannelToken] = useState('')
  const [channelConfig, setChannelConfig] = useState<Record<string, string>>({})
  const [savingChannel, setSavingChannel] = useState(false)
  const [provisioning, setProvisioning] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [terminalTabs, setTerminalTabs] = useState<{ id: number; name: string }[]>([
    { id: 1, name: 'Terminal 1' }
  ])
  const [activeTerminalTab, setActiveTerminalTab] = useState(1)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ordo-theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Update colors and persist theme preference
  const currentColors = useMemo(() => getColors(isDark), [isDark])
  colors = currentColors // Update global for skeleton

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('ordo-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Generate styles with current colors
  const styles = useMemo(() => createStyles(currentColors), [currentColors])

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

  const addTerminalTab = () => {
    const newId = Math.max(...terminalTabs.map(t => t.id)) + 1
    setTerminalTabs([...terminalTabs, { id: newId, name: `Terminal ${newId}` }])
    setActiveTerminalTab(newId)
  }

  const closeTerminalTab = (id: number) => {
    if (terminalTabs.length === 1) return // Keep at least one tab
    const newTabs = terminalTabs.filter(t => t.id !== id)
    setTerminalTabs(newTabs)
    if (activeTerminalTab === id) {
      setActiveTerminalTab(newTabs[newTabs.length - 1].id)
    }
  }

  const handleSaveAnthropicKey = async () => {
    if (!dashboard?.user || !anthropicKey) return
    setSavingKey('anthropic')
    try {
      await saveAnthropicKey({ userId: dashboard.user._id, anthropicKey })
      toast.success('Anthropic API key saved')
      setAnthropicKey('')
    } catch (err) {
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'Invalid key format',
      })
    } finally {
      setSavingKey(false)
    }
  }

  const handleSaveOpenaiKey = async () => {
    if (!dashboard?.user || !openaiKey) return
    setSavingKey('openai')
    try {
      await saveOpenaiKey({ userId: dashboard.user._id, openaiKey })
      toast.success('OpenAI API key saved')
      setOpenaiKey('')
    } catch (err) {
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'Invalid key format',
      })
    } finally {
      setSavingKey(false)
    }
  }

  const handleSaveGoogleKey = async () => {
    if (!dashboard?.user || !googleKey) return
    setSavingKey('google')
    try {
      await saveGoogleKey({ userId: dashboard.user._id, googleKey })
      toast.success('Google API key saved')
      setGoogleKey('')
    } catch (err) {
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'Invalid key format',
      })
    } finally {
      setSavingKey(false)
    }
  }

  const handleSaveChannel = async () => {
    if (!dashboard?.user || !activeChannel) return
    const platform = PLATFORMS.find(p => p.id === activeChannel)
    // For config-based platforms, token might be optional or in config
    if (!platform?.hasConfig && !channelToken) return
    
    setSavingChannel(true)
    try {
      await saveConnection({
        userId: dashboard.user._id,
        platform: activeChannel as any,
        token: channelToken,
        config: Object.keys(channelConfig).length > 0 ? channelConfig : undefined,
      })
      toast.success(`${platform?.name || activeChannel} connected`)
      setActiveChannel(null)
      setChannelToken('')
      setChannelConfig({})
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
        description: 'Your Ordo is being configured',
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
  const hasApiKey = !!(credentials?.hasAnthropicKey || credentials?.hasOpenaiKey || credentials?.hasGoogleKey)
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
            <button onClick={toggleTheme} style={styles.themeToggle} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
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
          <div className="hero-section" style={styles.hero}>
            <h1 className="hero-title" style={styles.title}>Your AI Assistant, Everywhere</h1>
            <p className="hero-subtitle" style={styles.subtitle}>
              Connect your AI assistant to Telegram, Discord, Slack, and WhatsApp in minutes.
              No servers to manage. No code to write.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="steps-container" style={styles.stepsContainer}>
            {[
              { num: 1, label: 'Subscribe' },
              { num: 2, label: 'API Key' },
              { num: 3, label: 'Channels' },
              { num: 4, label: 'Launch' },
            ].map((step) => (
              <div key={step.num} style={styles.step}>
                <div
                  className="step-circle"
                  style={{
                    ...styles.stepCircle,
                    background: currentStep > step.num ? currentColors.green : currentStep === step.num ? currentColors.accent : currentColors.border,
                    color: currentStep >= step.num ? '#fff' : currentColors.textMuted,
                  }}
                >
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    color: currentStep >= step.num ? currentColors.text : currentColors.textMuted,
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
              <div className="dashboard-card" style={{
                ...styles.card,
                opacity: currentStep === 1 ? 1 : 0.6,
                border: currentStep === 1 ? `2px solid ${currentColors.accent}` : `1px solid ${currentColors.border}`,
              }}>
                <div className="card-header" style={styles.cardHeader}>
                  <span className="step-badge" style={styles.stepBadge}>1</span>
                  <h3 className="card-title" style={styles.cardTitle}>Subscribe</h3>
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

              {/* Step 2: LLM API Keys */}
              <div className="dashboard-card" style={{
                ...styles.card,
                opacity: currentStep >= 2 ? 1 : 0.4,
                border: currentStep === 2 ? `2px solid ${currentColors.accent}` : `1px solid ${currentColors.border}`,
                pointerEvents: currentStep >= 2 ? 'auto' : 'none',
              }}>
                <div className="card-header" style={styles.cardHeader}>
                  <span className="step-badge" style={styles.stepBadge}>2</span>
                  <h3 className="card-title" style={styles.cardTitle}>LLM API Keys</h3>
                  {hasApiKey && <span style={styles.checkMark}>✓</span>}
                </div>
                <p style={{ ...styles.cardDesc, marginBottom: 16 }}>
                  Add at least one API key. More providers = more model choices.
                </p>

                {/* Anthropic */}
                <div style={styles.apiKeySection}>
                  <div style={styles.apiKeyHeader}>
                    <span style={styles.apiKeyProvider}>Anthropic</span>
                    <span style={styles.apiKeyModels}>Claude Opus, Sonnet, Haiku</span>
                  </div>
                  {credentials?.hasAnthropicKey ? (
                    <div style={styles.completedInfo}>
                      <code style={styles.keyPreview}>{credentials?.anthropicKeyPreview}</code>
                      <button style={styles.changeBtn} onClick={() => setAnthropicKey('sk-ant-')}>
                        Change
                      </button>
                    </div>
                  ) : (
                    <div style={styles.inputGroup}>
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        style={styles.input}
                      />
                      <button
                        style={{ ...styles.saveBtn, opacity: !anthropicKey || savingKey ? 0.7 : 1 }}
                        onClick={handleSaveAnthropicKey}
                        disabled={!anthropicKey || !!savingKey}
                      >
                        {savingKey === 'anthropic' ? '...' : 'Save'}
                      </button>
                    </div>
                  )}
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={styles.apiKeyLink}>
                    Get key from console.anthropic.com
                  </a>
                </div>

                {/* OpenAI */}
                <div style={styles.apiKeySection}>
                  <div style={styles.apiKeyHeader}>
                    <span style={styles.apiKeyProvider}>OpenAI</span>
                    <span style={styles.apiKeyModels}>GPT-4o, GPT-4o-mini, o1, o3-mini</span>
                  </div>
                  {credentials?.hasOpenaiKey ? (
                    <div style={styles.completedInfo}>
                      <code style={styles.keyPreview}>{credentials?.openaiKeyPreview}</code>
                      <button style={styles.changeBtn} onClick={() => setOpenaiKey('sk-')}>
                        Change
                      </button>
                    </div>
                  ) : (
                    <div style={styles.inputGroup}>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        style={styles.input}
                      />
                      <button
                        style={{ ...styles.saveBtn, opacity: !openaiKey || savingKey ? 0.7 : 1 }}
                        onClick={handleSaveOpenaiKey}
                        disabled={!openaiKey || !!savingKey}
                      >
                        {savingKey === 'openai' ? '...' : 'Save'}
                      </button>
                    </div>
                  )}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={styles.apiKeyLink}>
                    Get key from platform.openai.com
                  </a>
                </div>

                {/* Google */}
                <div style={{ ...styles.apiKeySection, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                  <div style={styles.apiKeyHeader}>
                    <span style={styles.apiKeyProvider}>Google</span>
                    <span style={styles.apiKeyModels}>Gemini 2.0 Flash, Gemini 1.5 Pro</span>
                  </div>
                  {credentials?.hasGoogleKey ? (
                    <div style={styles.completedInfo}>
                      <code style={styles.keyPreview}>{credentials?.googleKeyPreview}</code>
                      <button style={styles.changeBtn} onClick={() => setGoogleKey('AIza')}>
                        Change
                      </button>
                    </div>
                  ) : (
                    <div style={styles.inputGroup}>
                      <input
                        type="password"
                        placeholder="AIza..."
                        value={googleKey}
                        onChange={(e) => setGoogleKey(e.target.value)}
                        style={styles.input}
                      />
                      <button
                        style={{ ...styles.saveBtn, opacity: !googleKey || savingKey ? 0.7 : 1 }}
                        onClick={handleSaveGoogleKey}
                        disabled={!googleKey || !!savingKey}
                      >
                        {savingKey === 'google' ? '...' : 'Save'}
                      </button>
                    </div>
                  )}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={styles.apiKeyLink}>
                    Get key from aistudio.google.com
                  </a>
                </div>
              </div>

              {/* Step 3: Channels */}
              <div className="dashboard-card" style={{
                ...styles.card,
                opacity: currentStep >= 3 ? 1 : 0.4,
                border: currentStep === 3 ? `2px solid ${currentColors.accent}` : `1px solid ${currentColors.border}`,
                pointerEvents: currentStep >= 3 ? 'auto' : 'none',
              }}>
                <div className="card-header" style={styles.cardHeader}>
                  <span className="step-badge" style={styles.stepBadge}>3</span>
                  <h3 className="card-title" style={styles.cardTitle}>Connect Channels</h3>
                  {hasChannels && <span style={styles.checkMark}>✓</span>}
                </div>

                {/* Connected Channels */}
                {connections && connections.length > 0 && (
                  <div style={styles.connectedList}>
                    {connections.map((conn: { _id: string; platform: string; status: string; hasToken: boolean; tokenPreview: string | null; connectedAt: number }) => {
                      const platform = PLATFORMS.find(p => p.id === conn.platform)
                      return (
                        <div key={conn._id} className="connected-item" style={styles.connectedItemExpanded}>
                          <div style={styles.connectedItemHeader}>
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
                              title="Remove channel"
                            >
                              ×
                            </button>
                          </div>
                          {vmRunning && platform && (
                            <div style={styles.chatTipBox}>
                              <span style={styles.chatTipIcon}>💬</span>
                              <span style={styles.chatTipText}>{platform.chatTip}</span>
                            </div>
                          )}
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
                      <button style={styles.cancelBtn} onClick={() => { setActiveChannel(null); setChannelConfig({}); }}>
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
                    {/* Config fields for platforms that need them */}
                    {PLATFORMS.find(p => p.id === activeChannel)?.hasConfig && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                        {(PLATFORMS.find(p => p.id === activeChannel) as any)?.configFields?.map((field: { key: string; label: string; placeholder: string }) => (
                          <div key={field.key}>
                            <label style={{ fontSize: 12, color: currentColors.textMuted, marginBottom: 4, display: 'block' }}>
                              {field.label}
                            </label>
                            <input
                              type={field.key.toLowerCase().includes('hash') || field.key.toLowerCase().includes('pass') ? 'password' : 'text'}
                              placeholder={field.placeholder}
                              value={channelConfig[field.key] || ''}
                              onChange={(e) => setChannelConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                              style={styles.input}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Token/password field */}
                    <div>
                      <label style={{ fontSize: 12, color: currentColors.textMuted, marginBottom: 4, display: 'block' }}>
                        {PLATFORMS.find(p => p.id === activeChannel)?.hasConfig ? 'Password / Token' : 'Token'}
                      </label>
                      <input
                        type="password"
                        placeholder={PLATFORMS.find(p => p.id === activeChannel)?.placeholder}
                        value={channelToken}
                        onChange={(e) => setChannelToken(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <button
                      style={{
                        ...styles.primaryBtn,
                        marginTop: 12,
                        opacity: savingChannel ? 0.7 : 1,
                      }}
                      onClick={handleSaveChannel}
                      disabled={savingChannel}
                    >
                      {savingChannel ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                ) : (
                  <div className="platform-grid" style={styles.platformGrid}>
                    {PLATFORMS.map((platform) => {
                      const isConnected = connections?.some((c: { platform: string }) => c.platform === platform.id)
                      return (
                        <button
                          key={platform.id}
                          className="platform-btn"
                          style={{
                            ...styles.platformBtn,
                            opacity: isConnected ? 0.5 : 1,
                          }}
                          onClick={() => !isConnected && setActiveChannel(platform.id)}
                          disabled={isConnected}
                        >
                          <img src={platform.icon} alt={platform.name} className="platform-icon-img" style={styles.platformIconImg} />
                          <span>{platform.name}</span>
                          {isConnected && <span style={styles.connectedBadge}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Step 4: Launch */}
              <div className="dashboard-card" style={{
                ...styles.card,
                opacity: currentStep >= 4 ? 1 : 0.4,
                border: currentStep === 4 ? `2px solid ${currentColors.accent}` : `1px solid ${currentColors.border}`,
                pointerEvents: currentStep >= 4 ? 'auto' : 'none',
              }}>
                <div className="card-header" style={styles.cardHeader}>
                  <span className="step-badge" style={styles.stepBadge}>4</span>
                  <h3 className="card-title" style={styles.cardTitle}>Launch Instance</h3>
                  {vmRunning && <span style={styles.checkMark}>✓</span>}
                </div>

                {!hasVm ? (
                  <div>
                    <p style={styles.cardDesc}>
                      Your Ordo will be configured automatically with your API key and channels.
                    </p>
                    <button
                      style={{
                        ...styles.launchBtn,
                        opacity: provisioning ? 0.7 : 1,
                      }}
                      onClick={handleProvision}
                      disabled={provisioning}
                    >
                      {provisioning ? 'Launching...' : '🚀 Launch Ordo'}
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
                    <Lottie 
                      animationData={catPlayingAnimation} 
                      loop={true}
                      style={{ width: 120, height: 120 }}
                    />
                    <div style={styles.provisioningText}>
                      <span style={styles.provisioningTitle}>Setting up your Ordo...</span>
                      <span style={styles.provisioningSubtitle}>This usually takes 30-60 seconds</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={styles.runningState}>
                      <span style={{
                        ...styles.runningBadge,
                        background: dashboard?.vm?.status === 'stopped' ? currentColors.textMuted : currentColors.successBg,
                        color: dashboard?.vm?.status === 'stopped' ? '#fff' : currentColors.green,
                      }}>
                        {dashboard?.vm?.status === 'stopped' ? 'Stopped' : 'Running'}
                      </span>
                      <span style={styles.regionText}>Region: {dashboard?.vm?.region}</span>
                    </div>
                    <button
                      style={{
                        ...styles.reprovisionBtn,
                        opacity: retrying ? 0.7 : 1,
                      }}
                      onClick={handleRetry}
                      disabled={retrying}
                    >
                      {retrying ? 'Reprovisioning...' : '↻ Reprovision'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Section - Full Width Below */}
            {vmRunning && dashboard?.vm?.ip && (
              <div style={styles.terminalSection}>
                {/* Bot Status Info */}
                <div style={styles.botStatusCard}>
                  <div style={styles.botStatusHeader}>
                    <div style={styles.botStatusLeft}>
                      <span style={styles.botStatusIcon}>🤖</span>
                      <div>
                        <h3 style={styles.botStatusTitle}>Your Ordo is Running!</h3>
                        <p style={styles.botStatusSubtitle}>Ready to chat on {connections?.length || 0} channel{(connections?.length || 0) !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div style={styles.botStatusBadge}>
                      <span style={styles.botStatusDot} />
                      Active
                    </div>
                  </div>

                  {/* Step 1: Start the bot */}
                  <div style={styles.gettingStartedCard}>
                    <h4 style={styles.gettingStartedTitle}>🚀 First-Time Setup (Pairing)</h4>
                    <p style={styles.gettingStartedDesc}>New users must be approved before chatting. Follow these steps:</p>
                    <div style={styles.commandSteps}>
                      <div style={styles.commandStepItem}>
                        <span style={styles.commandStepNum}>1</span>
                        <div style={styles.commandStepContent}>
                          <code 
                            style={styles.commandStepCode}
                            onClick={() => {
                              navigator.clipboard.writeText('ordo doctor --fix')
                              toast.success('Copied!', { description: 'ordo doctor --fix' })
                            }}
                          >
                            ordo doctor --fix
                          </code>
                          <span style={styles.commandStepDesc}>Fix any configuration issues</span>
                        </div>
                      </div>
                      <div style={styles.commandStepItem}>
                        <span style={styles.commandStepNum}>2</span>
                        <div style={styles.commandStepContent}>
                          <code 
                            style={styles.commandStepCode}
                            onClick={() => {
                              navigator.clipboard.writeText('ordo gateway')
                              toast.success('Copied!', { description: 'ordo gateway' })
                            }}
                          >
                            ordo gateway
                          </code>
                          <span style={styles.commandStepDesc}>Start the gateway (must be running to receive pairing code)</span>
                        </div>
                      </div>
                      <div style={styles.commandStepItem}>
                        <span style={styles.commandStepNum}>3</span>
                        <div style={styles.commandStepContent}>
                          <span style={styles.commandStepDesc}>Open Telegram → find your bot → send <strong>/start</strong></span>
                          <span style={styles.commandStepDesc}>You'll receive an <strong>8-character pairing code</strong> (e.g. ABCD1234)</span>
                        </div>
                      </div>
                      <div style={styles.commandStepItem}>
                        <span style={styles.commandStepNum}>4</span>
                        <div style={styles.commandStepContent}>
                          <span style={styles.commandStepDesc}>Press <strong>Ctrl+C</strong> to stop the gateway, then approve:</span>
                          <code 
                            style={{ ...styles.commandStepCode, marginTop: 4 }}
                            onClick={() => {
                              navigator.clipboard.writeText('clawdbot pairing approve telegram ')
                              toast.success('Copied! Add your code at the end', { description: 'clawdbot pairing approve telegram CODE' })
                            }}
                          >
                            clawdbot pairing approve telegram CODE
                          </code>
                          <span style={styles.commandStepDesc}>Replace CODE with your 8-character code</span>
                        </div>
                      </div>
                      <div style={styles.commandStepItem}>
                        <span style={styles.commandStepNum}>5</span>
                        <div style={styles.commandStepContent}>
                          <code 
                            style={styles.commandStepCode}
                            onClick={() => {
                              navigator.clipboard.writeText('ordo gateway')
                              toast.success('Copied!', { description: 'ordo gateway' })
                            }}
                          >
                            ordo gateway
                          </code>
                          <span style={styles.commandStepDesc}>Start gateway again - now your messages will work!</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.pairingNote}>
                      <strong>Note:</strong> Pairing codes expire after 1 hour. After approval, you won't need to pair again.
                      <br />
                      <a href="https://docs.clawd.bot/start/pairing" target="_blank" rel="noopener noreferrer" style={styles.docsLinkAnchor}>
                        Read full pairing docs →
                      </a>
                    </div>
                    
                    {/* Status explanation */}
                    <div style={styles.statusExplainer}>
                      <h5 style={styles.statusExplainerTitle}>Understanding ordo status:</h5>
                      <div style={styles.statusItems}>
                        <div style={styles.statusItem}>
                          <span style={styles.statusGood}>ON + OK</span>
                          <span style={styles.statusItemDesc}>Channel is configured correctly</span>
                        </div>
                        <div style={styles.statusItem}>
                          <span style={styles.statusWarn}>WARN</span>
                          <span style={styles.statusItemDesc}>Minor issue - run <code style={styles.inlineCode}>ordo doctor --fix</code></span>
                        </div>
                        <div style={styles.statusItem}>
                          <span style={styles.statusInfo}>"no sessions yet"</span>
                          <span style={styles.statusItemDesc}>Normal! Appears until someone chats with your bot</span>
                        </div>
                      </div>
                    </div>

                    {/* Docs link */}
                    <div style={styles.docsLink}>
                      <span style={styles.docsLinkText}>Need help?</span>
                      <a href="https://docs.clawd.bot/faq" target="_blank" rel="noopener noreferrer" style={styles.docsLinkAnchor}>
                        FAQ
                      </a>
                      <span style={styles.docsLinkDivider}>•</span>
                      <a href="https://docs.clawd.bot/troubleshooting" target="_blank" rel="noopener noreferrer" style={styles.docsLinkAnchor}>
                        Troubleshooting
                      </a>
                      <span style={styles.docsLinkDivider}>•</span>
                      <a href="https://docs.clawd.bot" target="_blank" rel="noopener noreferrer" style={styles.docsLinkAnchor}>
                        Full Docs
                      </a>
                    </div>
                  </div>

                  {/* Step 2: Platform-specific instructions */}
                  <div style={styles.platformInstructions}>
                    {connections?.map((conn: { _id: string; platform: string }) => {
                      const platformGuides: Record<string, { title: string; steps: string[]; link: string; linkText: string }> = {
                        telegram: {
                          title: '📱 Step 2: Pair Your Telegram',
                          steps: [
                            '1. Run "ordo gateway" in the terminal below',
                            '2. Open Telegram and search for your bot username',
                            '3. Send /start - you\'ll get a pairing code (like ABCD1234)',
                            '4. Press Ctrl+C in terminal to stop the gateway',
                            '5. Run: clawdbot pairing approve telegram YOUR_CODE',
                            '6. Run "ordo gateway" again - now you can chat!',
                          ],
                          link: 'https://telegram.org/',
                          linkText: 'Open Telegram',
                        },
                        telegram_user: {
                          title: '📱 Step 2: Telegram (Full Access)',
                          steps: [
                            '1. Your AI can now read all your Telegram chats',
                            '2. It can message anyone on your behalf',
                            '3. Use responsibly - this has full account access',
                          ],
                          link: 'https://telegram.org/',
                          linkText: 'Open Telegram',
                        },
                        discord: {
                          title: '🎮 Step 2: Chat on Discord',
                          steps: [
                            '1. Go to Discord Developer Portal and get your bot\'s OAuth2 URL',
                            '2. Invite the bot to your server using that URL',
                            '3. In any channel, mention your bot: @YourBotName hello!',
                            '4. The bot will respond in the channel',
                          ],
                          link: 'https://discord.com/developers/applications',
                          linkText: 'Developer Portal',
                        },
                        slack: {
                          title: '💼 Step 2: Chat on Slack',
                          steps: [
                            '1. Install your Slack app to your workspace',
                            '2. Find the bot in your DMs or invite it to a channel',
                            '3. Send a direct message or @mention the bot',
                            '4. The bot will respond to your messages',
                          ],
                          link: 'https://slack.com/',
                          linkText: 'Open Slack',
                        },
                        whatsapp: {
                          title: '💬 Step 2: Chat on WhatsApp',
                          steps: [
                            '1. In the terminal, run: ordo channels login',
                            '2. Scan the QR code with WhatsApp on your phone',
                            '3. Once connected, message the WhatsApp number',
                            '4. Your AI will respond to messages',
                          ],
                          link: 'https://web.whatsapp.com/',
                          linkText: 'WhatsApp Web',
                        },
                        email: {
                          title: '📧 Step 2: Email',
                          steps: [
                            '1. Your AI can now read incoming emails',
                            '2. It will respond to emails on your behalf',
                            '3. Check your inbox for AI-generated replies',
                          ],
                          link: 'https://mail.google.com/',
                          linkText: 'Open Gmail',
                        },
                      }
                      
                      const guide = platformGuides[conn.platform]
                      if (!guide) return null
                      
                      return (
                        <div key={conn._id} style={styles.platformGuideCard}>
                          <h4 style={styles.platformGuideTitle}>{guide.title}</h4>
                          <div style={styles.platformGuideSteps}>
                            {guide.steps.map((step, i) => (
                              <p key={i} style={styles.platformGuideStep}>{step}</p>
                            ))}
                          </div>
                          <a
                            href={guide.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.platformGuideLink}
                          >
                            {guide.linkText} →
                          </a>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div style={styles.botStatusInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Pro tip:</span>
                      <span style={styles.infoValue}>Your bot uses Claude - it can help with coding, research, writing, and more!</span>
                    </div>
                  </div>
                </div>

                {/* Access Buttons */}
                <div style={styles.accessButtonsRow}>
                  <a
                    href={dashboard.vm.ip}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.accessBtn}
                  >
                    <span>🖥️</span> Open Terminal in New Tab
                  </a>
                </div>

                {/* Terminal Card */}
                <div style={styles.terminalCard}>
                  <div style={styles.terminalHeader}>
                    <div style={styles.terminalHeaderLeft}>
                      <div style={styles.terminalTabs}>
                        {terminalTabs.map((tab) => (
                          <div
                            key={tab.id}
                            style={{
                              ...styles.terminalTab,
                              ...(activeTerminalTab === tab.id ? styles.terminalTabActive : {}),
                            }}
                            onClick={() => setActiveTerminalTab(tab.id)}
                          >
                            <span>{tab.name}</span>
                            {terminalTabs.length > 1 && (
                              <button
                                style={styles.terminalTabClose}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  closeTerminalTab(tab.id)
                                }}
                                title="Close terminal"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          style={styles.terminalTabAdd}
                          onClick={addTerminalTab}
                          title="New terminal"
                        >
                          +
                        </button>
                      </div>
                      <span style={styles.terminalBadge}>Advanced</span>
                    </div>
                    <span style={styles.terminalHint}>For debugging only - everything is auto-configured!</span>
                  </div>
                  <div className="terminal-container" style={styles.terminalContainer}>
                    {terminalTabs.map((tab) => (
                      <iframe
                        key={tab.id}
                        src={dashboard?.vm?.ip || ''}
                        style={{
                          ...styles.terminalIframe,
                          display: activeTerminalTab === tab.id ? 'block' : 'none',
                        }}
                        title={`Ordo ${tab.name}`}
                        allow="clipboard-read; clipboard-write"
                      />
                    ))}
                  </div>
                  <div style={styles.terminalFooter}>
                    <div style={styles.commandsSection}>
                      <h4 style={styles.commandsSectionTitle}>Essential Commands (click to copy)</h4>
                      <div style={styles.commandsGrid}>
                        {[
                          { cmd: 'ordo status', label: 'ordo status', desc: '📊 Check bot & channel status', category: 'essential' },
                          { cmd: 'ordo doctor --fix', label: 'ordo doctor --fix', desc: '🔧 Fix issues automatically', category: 'essential' },
                          { cmd: 'ordo gateway', label: 'ordo gateway', desc: '🚀 START THE BOT (run this!)', category: 'essential', highlight: true },
                        ].map((item) => (
                          <button
                            key={item.cmd}
                            style={{
                              ...styles.commandCard,
                              ...(item.highlight ? styles.commandCardHighlight : {}),
                            }}
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd)
                              toast.success('Copied to clipboard', { description: item.cmd })
                            }}
                            title={`Copy: ${item.cmd}`}
                          >
                            <code style={{
                              ...styles.commandCode,
                              ...(item.highlight ? styles.commandCodeHighlight : {}),
                            }}>{item.label}</code>
                            <span style={styles.commandDesc}>{item.desc}</span>
                          </button>
                        ))}
                      </div>
                      
                      <h4 style={{ ...styles.commandsSectionTitle, marginTop: 16 }}>Pairing Commands</h4>
                      <div style={styles.commandsGrid}>
                        {[
                          { cmd: 'clawdbot pairing list telegram', label: 'clawdbot pairing list telegram', desc: 'See pending Telegram requests' },
                          { cmd: 'clawdbot pairing approve telegram ', label: 'clawdbot pairing approve telegram CODE', desc: 'Approve a Telegram user' },
                          { cmd: 'clawdbot pairing list discord', label: 'clawdbot pairing list discord', desc: 'See pending Discord requests' },
                          { cmd: 'clawdbot pairing approve discord ', label: 'clawdbot pairing approve discord CODE', desc: 'Approve a Discord user' },
                        ].map((item) => (
                          <button
                            key={item.cmd}
                            style={styles.commandCard}
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd)
                              toast.success('Copied to clipboard', { description: item.cmd })
                            }}
                            title={`Copy: ${item.cmd}`}
                          >
                            <code style={styles.commandCode}>{item.label}</code>
                            <span style={styles.commandDesc}>{item.desc}</span>
                          </button>
                        ))}
                      </div>

                      <h4 style={{ ...styles.commandsSectionTitle, marginTop: 16 }}>Other Useful Commands</h4>
                      <div style={styles.commandsGrid}>
                        {[
                          { cmd: 'ordo gateway --verbose', label: 'ordo gateway --verbose', desc: 'Start with detailed logging' },
                          { cmd: 'ordo channels login', label: 'ordo channels login', desc: 'WhatsApp QR code login' },
                          { cmd: 'tail -f ~/.clawdbot/clawdbot.log', label: 'tail -f logs', desc: 'Watch live bot activity' },
                          { cmd: 'ordo --help', label: 'ordo --help', desc: 'See all available commands' },
                        ].map((item) => (
                          <button
                            key={item.cmd}
                            style={styles.commandCard}
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd)
                              toast.success('Copied to clipboard', { description: item.cmd })
                            }}
                            title={`Copy: ${item.cmd}`}
                          >
                            <code style={styles.commandCode}>{item.label}</code>
                            <span style={styles.commandDesc}>{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
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
                      Ordo gives you a dedicated cloud server running an AI assistant
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

const createStyles = (c: Colors): Record<string, React.CSSProperties> => ({
  page: {
    minHeight: '100vh',
    width: '100%',
    background: c.bg,
    transition: 'background 0.3s ease',
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
    borderBottom: `1px solid ${c.border}`,
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
    color: c.text,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  themeToggle: {
    padding: '8px 12px',
    background: c.bgAlt,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: c.text,
  },
  walletDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: c.green,
  },
  disconnectBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: c.textSecondary,
    cursor: 'pointer',
  },
  adminBadge: {
    padding: '4px 10px',
    background: c.purple,
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
    color: c.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: c.textSecondary,
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
  accessButtonsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
  },
  accessBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 20px',
    background: c.accent,
    color: '#fff',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'transform 0.2s, opacity 0.2s',
  },
  card: {
    padding: 24,
    background: c.cardBg,
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
    background: c.accent,
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
    color: c.text,
    margin: 0,
    flex: 1,
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: c.green,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
  cardDesc: {
    fontSize: 14,
    color: c.textSecondary,
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
    background: c.successBg,
    color: c.green,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  planText: {
    fontSize: 14,
    color: c.textSecondary,
  },
  keyPreview: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: c.textSecondary,
    background: c.bgAlt,
    padding: '4px 8px',
    borderRadius: 4,
  },
  changeBtn: {
    fontSize: 13,
    color: c.accent,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  apiKeySection: {
    padding: '16px 0',
    borderBottom: `1px solid ${c.border}`,
    marginBottom: 16,
  },
  apiKeyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  apiKeyProvider: {
    fontSize: 15,
    fontWeight: 600,
    color: c.text,
  },
  apiKeyModels: {
    fontSize: 12,
    color: c.textMuted,
    background: c.bgAlt,
    padding: '2px 8px',
    borderRadius: 4,
  },
  apiKeyLink: {
    display: 'block',
    fontSize: 12,
    color: c.textMuted,
    marginTop: 8,
    textDecoration: 'none',
  },
  inputGroup: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: c.inputBg,
    color: c.text,
  },
  saveBtn: {
    padding: '12px 20px',
    background: c.accent,
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
    background: c.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  link: {
    color: c.accent,
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
    background: c.bgAlt,
    borderRadius: 8,
    marginBottom: 8,
  },
  connectedItemExpanded: {
    padding: '12px',
    background: c.bgAlt,
    borderRadius: 10,
    marginBottom: 10,
    border: `1px solid ${c.border}`,
  },
  connectedItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    padding: '10px 12px',
    background: c.successBg,
    borderRadius: 8,
    border: `1px solid ${c.green}22`,
  },
  chatTipIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  chatTipText: {
    fontSize: 13,
    color: c.green,
    lineHeight: 1.4,
  },
  connectedPlatform: {
    fontSize: 14,
    fontWeight: 500,
    color: c.text,
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
    color: c.green,
    fontWeight: 500,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: c.green,
    animation: 'pulse 2s infinite',
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: c.red,
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
    background: c.bgAlt,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: c.text,
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
    background: c.green,
    color: '#fff',
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChannelForm: {
    padding: 16,
    background: c.bgAlt,
    borderRadius: 12,
    color: c.text,
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
    color: c.textSecondary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  guideBox: {
    background: c.guideBoxBg,
    border: `1px solid ${c.guideBoxBorder}`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  guideText: {
    fontSize: 13,
    color: c.guideBoxText,
    margin: 0,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  guideLink: {
    fontSize: 13,
    fontWeight: 600,
    color: c.accent,
    textDecoration: 'none',
  },
  launchBtn: {
    width: '100%',
    padding: '16px 24px',
    background: c.green,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  reprovisionBtn: {
    width: '100%',
    marginTop: 12,
    padding: '10px 16px',
    background: 'transparent',
    color: c.textSecondary,
    border: `1px solid ${c.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  errorBox: {
    padding: 12,
    background: c.errorBg,
    border: `1px solid ${c.errorBorder}`,
    borderRadius: 8,
  },
  errorLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: c.red,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: c.errorText,
    wordBreak: 'break-word',
  },
  provisioningState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 24,
    background: c.bgAlt,
    borderRadius: 12,
  },
  provisioningText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  provisioningTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: c.text,
  },
  provisioningSubtitle: {
    fontSize: 13,
    color: c.textSecondary,
  },
  spinner: {
    width: 20,
    height: 20,
    border: `2px solid ${c.border}`,
    borderTopColor: c.accent,
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
    background: c.successBg,
    color: c.green,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },
  regionText: {
    fontSize: 13,
    color: c.textSecondary,
  },
  botStatusCard: {
    background: c.cardBg,
    borderRadius: 16,
    border: `1px solid ${c.border}`,
    padding: 20,
    marginBottom: 16,
  },
  botStatusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  botStatusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  botStatusIcon: {
    fontSize: 32,
  },
  botStatusTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: c.text,
    margin: 0,
  },
  botStatusSubtitle: {
    fontSize: 13,
    color: c.textSecondary,
    margin: 0,
    marginTop: 2,
  },
  botStatusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: c.successBg,
    color: c.green,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  botStatusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: c.green,
    animation: 'pulse 2s infinite',
  },
  gettingStartedCard: {
    padding: 20,
    background: `linear-gradient(135deg, ${c.accent}15 0%, ${c.green}15 100%)`,
    borderRadius: 12,
    border: `2px solid ${c.accent}`,
    marginBottom: 16,
  },
  gettingStartedTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: c.text,
    margin: 0,
    marginBottom: 8,
  },
  gettingStartedDesc: {
    fontSize: 14,
    color: c.textSecondary,
    margin: 0,
    marginBottom: 16,
  },
  commandSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  commandStepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  commandStepNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: c.accent,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  },
  commandStepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  commandStepCode: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: 600,
    color: c.accent,
    background: c.cardBg,
    padding: '8px 14px',
    borderRadius: 8,
    border: `1px solid ${c.border}`,
    cursor: 'pointer',
    display: 'inline-block',
  },
  commandStepDesc: {
    fontSize: 13,
    color: c.textMuted,
  },
  statusExplainer: {
    marginTop: 20,
    padding: 16,
    background: c.cardBg,
    borderRadius: 10,
    border: `1px solid ${c.border}`,
  },
  statusExplainerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: c.text,
    margin: 0,
    marginBottom: 12,
  },
  statusItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
  },
  statusGood: {
    padding: '2px 8px',
    background: c.successBg,
    color: c.green,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 600,
  },
  statusWarn: {
    padding: '2px 8px',
    background: c.guideBoxBg,
    color: c.guideBoxText,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 600,
  },
  statusInfo: {
    padding: '2px 8px',
    background: c.bgAlt,
    color: c.textMuted,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  statusItemDesc: {
    color: c.textSecondary,
  },
  inlineCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    background: c.bgAlt,
    padding: '1px 4px',
    borderRadius: 3,
    color: c.accent,
  },
  docsLink: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: `1px solid ${c.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  docsLinkText: {
    fontSize: 13,
    color: c.textMuted,
  },
  docsLinkAnchor: {
    fontSize: 13,
    fontWeight: 600,
    color: c.accent,
    textDecoration: 'none',
  },
  docsLinkDivider: {
    color: c.textMuted,
  },
  pairingNote: {
    marginTop: 16,
    padding: 12,
    background: c.bgAlt,
    borderRadius: 8,
    fontSize: 13,
    color: c.textSecondary,
    lineHeight: 1.5,
  },
  platformInstructions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  platformGuideCard: {
    padding: 20,
    background: c.bgAlt,
    borderRadius: 12,
    border: `1px solid ${c.border}`,
  },
  platformGuideTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: c.text,
    margin: 0,
    marginBottom: 12,
  },
  platformGuideSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
  },
  platformGuideStep: {
    fontSize: 14,
    color: c.textSecondary,
    margin: 0,
    lineHeight: 1.5,
    paddingLeft: 4,
  },
  platformGuideLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
    fontWeight: 600,
    color: c.accent,
    textDecoration: 'none',
  },
  quickActionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  quickActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    background: c.accent,
    color: '#fff',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'transform 0.2s, background 0.2s',
    cursor: 'pointer',
  },
  quickActionArrow: {
    opacity: 0.7,
    marginLeft: 4,
  },
  botStatusInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    background: c.bgAlt,
    borderRadius: 8,
  },
  infoItem: {
    display: 'flex',
    gap: 8,
    fontSize: 13,
    lineHeight: 1.4,
  },
  infoLabel: {
    color: c.textMuted,
    fontWeight: 500,
    flexShrink: 0,
  },
  infoValue: {
    color: c.textSecondary,
  },
  terminalCard: {
    background: c.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    border: `1px solid ${c.border}`,
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${c.border}`,
  },
  terminalHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  terminalTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  terminalTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: c.bgAlt,
    border: `1px solid ${c.border}`,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    color: c.textSecondary,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  terminalTabActive: {
    background: c.cardBg,
    color: c.text,
    borderColor: c.accent,
  },
  terminalTabClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 3,
    fontSize: 14,
    color: c.textMuted,
    cursor: 'pointer',
    lineHeight: 1,
    transition: 'all 0.15s',
  },
  terminalTabAdd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    padding: 0,
    background: 'transparent',
    border: `1px dashed ${c.border}`,
    borderRadius: 6,
    fontSize: 18,
    color: c.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  terminalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: c.text,
    margin: 0,
  },
  terminalBadge: {
    padding: '3px 8px',
    background: c.bgAlt,
    color: c.textMuted,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 500,
  },
  terminalHint: {
    fontSize: 12,
    color: c.textMuted,
  },
  terminalFooter: {
    padding: '20px',
    borderTop: `1px solid ${c.border}`,
    background: c.bgAlt,
  },
  commandsSection: {
    width: '100%',
  },
  commandsSectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: c.text,
    marginBottom: 12,
    margin: 0,
  },
  commandsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 10,
  },
  commandCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: '12px 14px',
    background: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  commandCardHighlight: {
    background: `linear-gradient(135deg, ${c.green}20 0%, ${c.accent}20 100%)`,
    border: `2px solid ${c.green}`,
  },
  commandCode: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: 600,
    color: c.accent,
  },
  commandCodeHighlight: {
    color: c.green,
    fontSize: 14,
  },
  commandDesc: {
    fontSize: 12,
    color: c.textMuted,
  },
  terminalFooterLabel: {
    fontSize: 12,
    color: c.textMuted,
    fontWeight: 500,
  },
  terminalCommands: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  terminalCmdBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    background: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  terminalCmdCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: c.accent,
  },
  codeSnippet: {
    fontFamily: 'monospace',
    background: c.cardBg,
    padding: '2px 6px',
    borderRadius: 4,
    color: c.accent,
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
    background: `linear-gradient(135deg, ${c.accent}15 0%, ${c.purple}15 100%)`,
    borderRadius: 16,
    border: `1px solid ${c.border}`,
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
    color: c.text,
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
    color: c.textSecondary,
    lineHeight: 1.4,
  },
  featureCheck: {
    color: c.green,
    fontWeight: 600,
    flexShrink: 0,
  },
  faqSection: {
    marginTop: 48,
    paddingTop: 32,
    borderTop: `1px solid ${c.border}`,
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
    color: c.textSecondary,
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
    background: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 600,
    color: c.text,
    marginBottom: 8,
    margin: 0,
  },
  faqAnswer: {
    fontSize: 14,
    color: c.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    marginTop: 8,
  },
  faqLink: {
    color: c.accent,
    textDecoration: 'none',
  },
})

// Default styles for initial render (light mode)
const styles = createStyles(lightColors)

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
      gap: 12px !important;
    }
    
    .platform-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 6px !important;
    }
    
    .faq-grid {
      grid-template-columns: 1fr !important;
    }
    
    .dashboard-card {
      padding: 16px !important;
    }
    
    .steps-container {
      gap: 24px !important;
      padding: 16px 0 !important;
      margin-bottom: 24px !important;
    }
    
    .step-circle {
      width: 28px !important;
      height: 28px !important;
      font-size: 12px !important;
    }
    
    .hero-section {
      margin-bottom: 20px !important;
    }
    
    .hero-title {
      font-size: 24px !important;
    }
    
    .hero-subtitle {
      font-size: 14px !important;
    }
  }
  
  @media (max-width: 480px) {
    .platform-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    
    .platform-btn {
      padding: 12px 8px !important;
      font-size: 12px !important;
    }
    
    .platform-icon-img {
      width: 24px !important;
      height: 24px !important;
    }
    
    .dashboard-card {
      padding: 14px !important;
    }
    
    .card-title {
      font-size: 14px !important;
    }
    
    .card-header {
      margin-bottom: 12px !important;
    }
    
    .step-badge {
      width: 20px !important;
      height: 20px !important;
      font-size: 10px !important;
    }
    
    .connected-item {
      padding: 8px 10px !important;
    }
    
    .terminal-container {
      height: 400px !important;
    }
  }
`
document.head.appendChild(styleSheet)
