import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'
import { App } from './App'
import { Dashboard } from './Dashboard'
import { NotFound } from './NotFound'
import './mobile.css'
import '@solana/wallet-adapter-react-ui/styles.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

// Solana RPC endpoint - use a dedicated provider for production
// Get a free RPC from Helius (https://helius.dev) or QuickNode
const endpoint = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')

// Supported wallets
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
]

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ConvexProvider client={convex}>
            <Toaster 
              position="top-center" 
              toastOptions={{
                style: {
                  background: '#FFFFFF',
                  color: '#1A1715',
                  border: '1px solid #E8E6E3',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Analytics />
          </ConvexProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </BrowserRouter>
)
