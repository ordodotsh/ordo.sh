import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const colors = {
  accent: '#D97706',
  accentHover: '#B45309',
  text: '#1A1715',
  textSecondary: '#6B6560',
  cardBg: '#FFFFFF',
  border: '#E8E6E3',
}

export function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const navigate = useNavigate()
  const getOrCreateUser = useMutation(api.users.getOrCreate)

  // Register user and redirect to dashboard when wallet connects
  useEffect(() => {
    if (publicKey) {
      getOrCreateUser({ wallet: publicKey.toBase58() })
        .then(() => {
          navigate('/dashboard')
        })
        .catch((err) => {
          console.error('Failed to register user:', err)
          // Still navigate to dashboard - they can retry payment there
          navigate('/dashboard')
        })
    }
  }, [publicKey, getOrCreateUser, navigate])

  const handleClick = () => {
    if (publicKey) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 24px',
        background: publicKey ? colors.cardBg : colors.accent,
        color: publicKey ? colors.text : '#fff',
        border: publicKey ? `1px solid ${colors.border}` : 'none',
        borderRadius: 10,
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: 14,
        cursor: connecting ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        opacity: connecting ? 0.7 : 1,
      }}
    >
      {connecting ? (
        'Connecting...'
      ) : publicKey ? (
        <>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22C55E'
          }} />
          {truncateAddress(publicKey.toBase58())}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 128 128" fill="currentColor">
            <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 112c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"/>
            <path d="M64 32c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"/>
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  )
}
