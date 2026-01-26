import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'src/public',
  define: {
    global: 'globalThis',
  },
  resolve: {
    // Dedupe packages that may have multiple copies
    dedupe: ['semver', '@solana/web3.js'],
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      // Ignore semver exports resolution issues
      ignoreDynamicRequires: true,
    },
    rollupOptions: {
      // Handle problematic packages
      onwarn(warning, warn) {
        // Suppress semver warnings
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.exporter?.includes('semver')) {
          return
        }
        warn(warning)
      },
    },
  },
  optimizeDeps: {
    include: [
      '@solana/web3.js',
      '@solana/wallet-adapter-react', 
      '@solana/wallet-adapter-wallets',
      'semver',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
