import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { api } from '../../convex/_generated/api'

// Treasury wallet to receive payments
const TREASURY_WALLET = new PublicKey('vzKiUT2mjZqCce8iLgm9SJUUGd7bY9fXd3De56LRdTq')
const SUBSCRIPTION_AMOUNT = 0.2 * LAMPORTS_PER_SOL // 0.2 SOL in lamports

export function usePayment() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const createSubscription = useMutation(api.subscriptions.create)

  const [paying, setPaying] = useState(false)

  const pay = async () => {
    if (!publicKey) {
      toast.error('Wallet not connected')
      return { success: false }
    }

    setPaying(true)

    try {
      // Check balance first
      const balance = await connection.getBalance(publicKey)
      const requiredAmount = SUBSCRIPTION_AMOUNT + 5000 // Add buffer for fees
      
      if (balance < requiredAmount) {
        const needed = (requiredAmount - balance) / LAMPORTS_PER_SOL
        toast.error('Insufficient balance', {
          description: `You need ~${needed.toFixed(4)} more SOL`,
          action: {
            label: 'Get SOL',
            onClick: () => window.open('https://www.moonpay.com/buy/sol', '_blank'),
          },
          duration: 8000,
        })
        setPaying(false)
        return { success: false }
      }

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: SUBSCRIPTION_AMOUNT,
        })
      )

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send transaction
      let signature: string
      try {
        signature = await sendTransaction(transaction, connection)
      } catch (walletErr: unknown) {
        // Handle wallet-specific errors
        const errMsg = walletErr instanceof Error ? walletErr.message : String(walletErr)
        if (errMsg.includes('User rejected')) {
          throw new Error('Transaction cancelled')
        }
        if (errMsg.includes('Unexpected error')) {
          throw new Error('Wallet error - make sure your wallet is set to devnet and has SOL')
        }
        throw walletErr
      }

      // Wait for confirmation with timeout
      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      )

      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err))
      }

      // Record subscription in Convex
      await createSubscription({
        wallet: publicKey.toBase58(),
        txSignature: signature,
        solAmount: 0.2,
      })

      toast.success('Subscription activated!', {
        description: 'Your Ordo instance is being provisioned',
      })

      setPaying(false)
      return { success: true, signature }
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Payment failed'
      let description: string | undefined
      
      // Add helpful hints for common issues
      if (message.includes('block height exceeded') || message.includes('not found')) {
        message = 'Transaction expired'
        description = 'Make sure your wallet is on the same network (devnet for testing)'
      } else if (message.includes('User rejected') || message.includes('cancelled')) {
        message = 'Transaction cancelled'
      } else if (message.includes('Wallet error')) {
        description = 'Check your wallet is on devnet and has SOL'
      }
      
      toast.error(message, { description })
      setPaying(false)
      return { success: false, error: message }
    }
  }

  return { pay, paying }
}
