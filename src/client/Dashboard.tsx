import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery, useAction } from 'convex/react'
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
}

export function Dashboard() {
  const { publicKey, disconnect } = useWallet()
  const navigate = useNavigate()
  const walletAddress = publicKey?.toBase58() || ''
  const dashboard = useQuery(api.users.getDashboard, walletAddress ? { wallet: walletAddress } : 'skip')
  const { pay, paying } = usePayment()
  const retryProvision = useAction(api.vms.retry)
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    if (!walletAddress) return
    setRetrying(true)
    try {
      await retryProvision({ wallet: walletAddress })
      toast.success('Provisioning started', {
        description: 'Your instance is being created',
      })
    } catch (err) {
      toast.error('Failed to retry', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setRetrying(false)
    }
  }

  // Redirect to home if not connected
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

  if (!publicKey) {
    return null
  }

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
            {dashboard?.isAdmin && (
              <span style={styles.adminBadge}>Admin</span>
            )}
            <div style={styles.walletInfo}>
              <span style={styles.walletDot} />
              {truncateAddress(walletAddress)}
            </div>
            <button onClick={handleDisconnect} style={styles.disconnectBtn}>
              Disconnect
            </button>
          </div>
        </header>

        {/* Main Dashboard */}
        <main style={styles.main}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Manage your Ordo instance</p>

          {/* Status Cards */}
          <div style={styles.cardsGrid}>
            {/* Subscription Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Subscription</h3>
              {dashboard?.subscription ? (
                <div>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Status</span>
                    <span style={{
                      ...styles.statusBadge,
                      background: dashboard.subscription.status === 'active' ? '#DCFCE7' : '#FEF2F2',
                      color: dashboard.subscription.status === 'active' ? colors.green : colors.red,
                    }}>
                      {dashboard.subscription.status}
                    </span>
                  </div>
                  {dashboard.isAdmin ? (
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Plan</span>
                      <span style={styles.statusValue}>Lifetime (Admin)</span>
                    </div>
                  ) : dashboard.subscription.solAmount && (
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Amount Paid</span>
                      <span style={styles.statusValue}>
                        {dashboard.subscription.solAmount} SOL
                      </span>
                    </div>
                  )}
                  {dashboard.subscription.paidAt && !dashboard.isAdmin && (
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Paid On</span>
                      <span style={styles.statusValue}>
                        {new Date(dashboard.subscription.paidAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {dashboard.subscription.expiresAt && !dashboard.isAdmin && (
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Expires</span>
                      <span style={styles.statusValue}>
                        {new Date(dashboard.subscription.expiresAt).toLocaleDateString()}
                        <span style={styles.daysLeft}>
                          ({Math.max(0, Math.ceil((dashboard.subscription.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} days left)
                        </span>
                      </span>
                    </div>
                  )}
                  {dashboard.subscription.txSignature && (
                    <div style={styles.txRow}>
                      <span style={styles.statusLabel}>Transaction</span>
                      <a
                        href={`https://explorer.solana.com/tx/${dashboard.subscription.txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.txLink}
                      >
                        {dashboard.subscription.txSignature.slice(0, 8)}...{dashboard.subscription.txSignature.slice(-8)}
                        <span style={styles.externalIcon}> ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No active subscription</p>
                  <button
                    style={{
                      ...styles.primaryBtn,
                      opacity: paying ? 0.7 : 1,
                      cursor: paying ? 'wait' : 'pointer',
                    }}
                    onClick={pay}
                    disabled={paying}
                  >
                    {paying ? 'Processing...' : 'Subscribe (0.2 SOL/month)'}
                  </button>
                </div>
              )}
            </div>

            {/* VM Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Your Instance</h3>
              {dashboard?.vm ? (
                <div>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Status</span>
                    <span style={{
                      ...styles.statusBadge,
                      background: dashboard.vm.status === 'running' ? '#DCFCE7' :
                                  dashboard.vm.status === 'failed' ? '#FEF2F2' : '#FEF9C4',
                      color: dashboard.vm.status === 'running' ? colors.green :
                             dashboard.vm.status === 'failed' ? colors.red : colors.accent,
                    }}>
                      {dashboard.vm.status}
                    </span>
                  </div>
                  <div style={styles.statusRow}>
                    <span style={styles.statusLabel}>Region</span>
                    <span style={styles.statusValue}>{dashboard.vm.region}</span>
                  </div>
                  {dashboard.vm.status === 'running' && dashboard.vm.ip && (
                    <a
                      href={dashboard.vm.ip}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.terminalBtn}
                    >
                      Open Terminal
                    </a>
                  )}
                  {dashboard.vm.status === 'failed' && dashboard.vm.error && (
                    <div style={styles.errorBox}>
                      <span style={styles.errorLabel}>Error</span>
                      <span style={styles.errorText}>{dashboard.vm.error}</span>
                    </div>
                  )}
                  {dashboard.vm.status === 'failed' && (
                    <button
                      style={{
                        ...styles.retryBtn,
                        opacity: retrying ? 0.7 : 1,
                        cursor: retrying ? 'wait' : 'pointer',
                      }}
                      onClick={handleRetry}
                      disabled={retrying}
                    >
                      {retrying ? 'Retrying...' : 'Retry Provisioning'}
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No instance provisioned</p>
                  <p style={styles.emptyHint}>Subscribe to get your own Clawdbot instance</p>
                </div>
              )}
            </div>

            {/* Connections Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Connections</h3>
              {dashboard?.connections && dashboard.connections.length > 0 ? (
                <div style={styles.connectionsList}>
                  {dashboard.connections.map((conn) => (
                    <div key={conn._id} style={styles.connectionItem}>
                      <span style={styles.connectionPlatform}>{conn.platform}</span>
                      <span style={styles.connectionStatus}>Connected</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No platforms connected</p>
                  <p style={styles.emptyHint}>Connect Telegram, Discord, or other platforms</p>
                </div>
              )}
              <button style={styles.secondaryBtn}>
                + Add Connection
              </button>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div style={styles.comingSoon}>
            <p style={styles.comingSoonText}>
              🚧 Dashboard features coming soon. Follow{' '}
              <a href="https://x.com/ordodotsh" target="_blank" rel="noopener noreferrer" style={styles.link}>
                @ordodotsh
              </a>{' '}
              for updates.
            </p>
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
    maxWidth: 1000,
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
  main: {
    padding: '40px 0',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  card: {
    padding: 24,
    background: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  emptyState: {
    textAlign: 'center',
    padding: '16px 0',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  primaryBtn: {
    padding: '12px 24px',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryBtn: {
    width: '100%',
    padding: '10px 16px',
    background: colors.bgAlt,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: 16,
  },
  connectionsList: {
    marginBottom: 8,
  },
  connectionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  connectionPlatform: {
    fontSize: 14,
    fontWeight: 500,
    color: colors.text,
    textTransform: 'capitalize',
  },
  connectionStatus: {
    fontSize: 12,
    color: colors.green,
  },
  comingSoon: {
    padding: 24,
    background: colors.bgAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.textSecondary,
    margin: 0,
  },
  link: {
    color: colors.accent,
    textDecoration: 'none',
  },
  daysLeft: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 6,
  },
  txRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${colors.border}`,
  },
  txLink: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: colors.accent,
    textDecoration: 'none',
    wordBreak: 'break-all',
  },
  externalIcon: {
    fontSize: 11,
  },
  errorBox: {
    marginTop: 12,
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
  adminBadge: {
    padding: '4px 10px',
    background: '#7C3AED',
    color: '#fff',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
  },
  retryBtn: {
    marginTop: 12,
    padding: '10px 16px',
    background: colors.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  terminalBtn: {
    display: 'block',
    marginTop: 16,
    padding: '12px 16px',
    background: colors.text,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
  },
}
