import { Scroll } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Brain, Code, Activity, Music, TrendingUp, Sparkles, Droplets, Zap, Dumbbell } from 'lucide-react'

interface OverlayProps {
  mood: number
  setMood: (mood: number) => void
}

export default function Overlay({ mood, setMood }: OverlayProps) {
  // Framer Motion provides a great way to handle scroll-based triggers via `whileInView`
  // We use standard HTML scroll events via the <Scroll html> wrapper from drei

  return (
    <Scroll html style={{ width: '100vw' }}>
      {/* 1. Hero Section */}
      <section className="scroll-section hero-section">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
        >
          <h1 className="gradient-text-accent" style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>
            A U R A
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Your evolving digital manifestation of habits, intellect, and mood.
          </p>

          <h3 style={{ marginBottom: '1rem', fontWeight: 500 }}>Select your mood today</h3>
          <div className="mood-selector">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                className={`mood-btn ${mood === m ? 'active' : ''}`}
                onClick={() => setMood(m)}
              >
                {m === 1 && <Droplets />}
                {m === 2 && <TrendingUp />}
                {m === 3 && <Sparkles />}
                {m === 4 && <Zap />}
                {m === 5 && <Zap style={{ color: '#fff', filter: 'drop-shadow(0 0 10px #fff)' }} />}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 2. Learnings Section */}
      <section className="scroll-section learn-section">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ maxWidth: '600px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-icon" style={{ background: 'var(--accent-3)' }}>
              <Brain />
            </div>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem' }}>Learnings</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
            Your intellect is expanding. Current records from Duolingo and LeetCode
            fuel the structural complexity of your aura, adding dense geometric distortions.
          </p>
          
          <div className="stats-grid">
            <div className="stat-item glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="stat-icon" style={{ background: '#58cc02' }}>
                <Activity size={24} />
              </div>
              <div className="stat-text">
                <h4 style={{ margin: 0 }}>45 Day Streak</h4>
                <p style={{ margin: 0 }}>Duolingo</p>
              </div>
            </div>
            <div className="stat-item glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div className="stat-icon" style={{ background: '#ffa116' }}>
                <Code size={24} />
              </div>
              <div className="stat-text">
                <h4 style={{ margin: 0 }}>24 Problems</h4>
                <p style={{ margin: 0 }}>LeetCode this week</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Habits Section */}
      <section className="scroll-section habit-section">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ maxWidth: '600px', marginLeft: 'auto' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="gradient-text" style={{ fontSize: '2.5rem' }}>Habits & Vibes</h2>
            <div className="stat-icon" style={{ background: 'var(--accent-2)' }}>
              <Activity />
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
            Physical activity and sonic vibrations sculpt your aura's movement and base frequency colors.
          </p>
          
          <div className="stats-grid" style={{ direction: 'rtl', marginTop: '2rem' }}>
            <div className="stat-item glass-card" style={{ direction: 'ltr', textAlign: 'left', padding: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="stat-icon" style={{ background: '#3b82f6' }}>
                <Dumbbell size={24} />
              </div>
              <div className="stat-text">
                <h4 style={{ margin: 0 }}>8,432 Steps</h4>
                <p style={{ margin: 0 }}>Google Fit today</p>
              </div>
            </div>
            <div className="stat-item glass-card" style={{ direction: 'ltr', textAlign: 'left', padding: '1.25rem', border: '1px solid rgba(29, 185, 84, 0.2)' }}>
              <div className="stat-icon" style={{ background: '#1db954' }}>
                <Music size={24} />
              </div>
              <div className="stat-text">
                <h4 style={{ margin: 0 }}>Ambient Beats</h4>
                <p style={{ margin: 0 }}>Spotify top genre</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Evolution Summary Section */}
      <section className="scroll-section mood-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card animate-float"
        >
          <h2 className="gradient-text-accent" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Aura State
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Your aura is highly energetic, radiating dynamic purple and pink hues influenced by your learning streak and upbeat music taste.
          </p>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Sync Integrations
          </button>
        </motion.div>
      </section>
    </Scroll>
  )
}
