import Lottie from 'lottie-react'
import { Link } from 'react-router-dom'
import catAnimation from '../assets/cat_playing.json'

const colors = {
  bg: '#FAF9F7',
  text: '#1A1715',
  textSecondary: '#6B6560',
  textMuted: '#9A9590',
  accent: '#D97706',
  border: '#E8E6E3',
}

export function NotFound() {
  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <Lottie 
          animationData={catAnimation} 
          style={styles.catLottie} 
          loop 
        />
        <h1 style={styles.title}>404</h1>
        <p style={styles.subtitle}>Oops! This page got lost in the chaos.</p>
        <p style={styles.motto}>ab chao, ordo... but not here</p>
        <Link to="/" style={styles.homeButton}>
          Take me home
        </Link>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: colors.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    textAlign: 'center',
    padding: '40px 24px',
  },
  catLottie: {
    width: 300,
    height: 300,
    margin: '0 auto 24px auto',
  },
  title: {
    fontSize: 72,
    fontWeight: 700,
    color: colors.text,
    margin: '0 0 8px 0',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  motto: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 32,
  },
  homeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    background: colors.accent,
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 16,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
}
