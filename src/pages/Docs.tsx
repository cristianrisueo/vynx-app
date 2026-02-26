import Footer from '@/components/Footer'

type Page = 'home' | 'docs'

export default function Docs({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      {/* Simplified Navbar */}
      <nav
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '28px 60px',
        }}
      >
        <div
          onClick={() => setPage('home')}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 38,
            letterSpacing: 4,
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'inline-block',
          }}
        >
          VYN<span style={{ color: 'var(--gold)' }}>X</span>
        </div>
      </nav>

      {/* Centered content */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 32,
              height: 1,
              background: 'var(--gold)',
              flexShrink: 0,
            }}
          />
          Coming Soon
          <span
            style={{
              display: 'block',
              width: 32,
              height: 1,
              background: 'var(--gold)',
              flexShrink: 0,
            }}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
