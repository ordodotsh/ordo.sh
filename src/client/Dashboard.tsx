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
  { id: 'telegram', name: 'Telegram', icon: '✈️', placeholder: 'Bot token from @BotFather' },
  { id: 'discord', name: 'Discord', icon: '🎮', placeholder: 'Bot token from Discord Developer Portal' },
  { id: 'slack', name: 'Slack', icon: '💬', placeholder: 'Bot token from Slack API' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱', placeholder: 'API token from WhatsApp Business' },
] as const

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
          <div style={styles.mainGrid}>
            {/* Left Column - Setup */}
            <div style={styles.setupColumn}>
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
                    {connections.map((conn) => (
                      <div key={conn._id} style={styles.connectedItem}>
                        <span style={styles.connectedPlatform}>
                          {PLATFORMS.find(p => p.id === conn.platform)?.icon}{' '}
                          {PLATFORMS.find(p => p.id === conn.platform)?.name}
                        </span>
                        <button
                          style={styles.removeBtn}
                          onClick={() => handleRemoveChannel(conn._id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Channel */}
                {activeChannel ? (
                  <div style={styles.addChannelForm}>
                    <div style={styles.channelFormHeader}>
                      <span>
                        {PLATFORMS.find(p => p.id === activeChannel)?.icon}{' '}
                        {PLATFORMS.find(p => p.id === activeChannel)?.name}
                      </span>
                      <button style={styles.cancelBtn} onClick={() => setActiveChannel(null)}>
                        Cancel
                      </button>
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
                        marginTop: 8,
                        opacity: !channelToken || savingChannel ? 0.7 : 1,
                      }}
                      onClick={handleSaveChannel}
                      disabled={!channelToken || savingChannel}
                    >
                      {savingChannel ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                ) : (
                  <div style={styles.platformGrid}>
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
                          <span style={styles.platformIcon}>{platform.icon}</span>
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

            {/* Right Column - Terminal / Status */}
            <div style={styles.terminalColumn}>
              {vmRunning && dashboard?.vm?.ip ? (
                <div style={styles.terminalCard}>
                  <div style={styles.terminalHeader}>
                    <h3 style={styles.terminalTitle}>Terminal</h3>
                    <a
                      href={dashboard.vm.ip}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.openNewTabBtn}
                    >
                      Open in new tab ↗
                    </a>
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
              ) : (
                <div style={styles.previewCard}>
                  <div style={styles.previewContent}>
                    <div style={styles.previewIcon}>🤖</div>
                    <h3 style={styles.previewTitle}>What you'll get</h3>
                    <ul style={styles.featureList}>
                      <li style={styles.featureItem}>
                        <span style={styles.featureCheck}>✓</span>
                        24/7 AI assistant on your favorite platforms
                      </li>
                      <li style={styles.featureItem}>
                        <span style={styles.featureCheck}>✓</span>
                        Powered by Claude - Anthropic's most capable AI
                      </li>
                      <li style={styles.featureItem}>
                        <span style={styles.featureCheck}>✓</span>
                        Web terminal for advanced configuration
                      </li>
                      <li style={styles.featureItem}>
                        <span style={styles.featureCheck}>✓</span>
                        Automatic updates and maintenance
                      </li>
                      <li style={styles.featureItem}>
                        <span style={styles.featureCheck}>✓</span>
                        Your data stays private on your instance
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
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
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  setupColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  terminalColumn: {
    position: 'sticky',
    top: 24,
    height: 'fit-content',
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
  openNewTabBtn: {
    padding: '6px 12px',
    background: colors.bgAlt,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  terminalContainer: {
    width: '100%',
    height: 500,
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
}

// Add keyframes for spinner animation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(styleSheet)
