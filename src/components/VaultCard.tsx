import { useAccount, useConnect, useConnectors } from 'wagmi'

export interface Strategy {
  label: string
  pct: number
  delay?: string
}

export interface VaultCardProps {
  tier: string
  name: string
  apy: string
  tvl: string
  sharePrice: string
  strategies: Strategy[]
}

export default function VaultCard({ tier, name, apy, tvl, sharePrice, strategies }: VaultCardProps) {
  // TODO: useVault hook — replace mock data with on-chain reads
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  const connectors = useConnectors()

  function handleConnect() {
    const injected = connectors[0]
    if (injected) connect({ connector: injected })
  }

  return (
    <div className="vault-card" style={{ padding: 56 }}>
      {/* Tier label */}
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 8,
        }}
      >
        {tier}
      </div>

      {/* Vault name */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 40,
          letterSpacing: 2,
          marginBottom: 48,
          color: 'var(--text)',
        }}
      >
        {name}
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          marginBottom: 48,
        }}
      >
        <StatItem label="APY" value={apy} green />
        <StatItem label="TVL" value={tvl} />
        {/* TODO: useVault hook for user position */}
        <StatItem label="Your Position" value="—" />
        <StatItem label="Share Price" value={sharePrice} />
      </div>

      {/* Strategy breakdown */}
      <div style={{ marginBottom: 48 }}>
        {strategies.map((s, i) => (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: 1,
                color: 'var(--muted)',
                marginBottom: 6,
              }}
            >
              <span>{s.label}</span>
              <span>{s.pct}%</span>
            </div>
            <div
              style={{
                height: 2,
                background: 'var(--border)',
                marginBottom: 12,
                position: 'relative',
              }}
            >
              <div
                className="strategy-bar-fill"
                style={{
                  width: `${s.pct}%`,
                  animationDelay: s.delay ?? '0s',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        {isConnected ? (
          <>
            <VaultButton primary>Deposit</VaultButton>
            <VaultButton>Withdraw</VaultButton>
          </>
        ) : (
          <>
            <VaultButton primary onClick={handleConnect}>
              Connect Wallet
            </VaultButton>
            <VaultButton onClick={handleConnect}>Connect Wallet</VaultButton>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function StatItem({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: green ? 'var(--green)' : 'var(--text)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function VaultButton({
  children,
  primary,
  onClick,
}: {
  children: React.ReactNode
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
        padding: 14,
        border: primary ? '1px solid var(--gold)' : '1px solid var(--border)',
        background: primary ? 'var(--gold-dim)' : 'none',
        color: primary ? 'var(--gold)' : 'var(--text)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!primary) {
          e.currentTarget.style.borderColor = 'var(--gold)'
          e.currentTarget.style.color = 'var(--gold)'
        }
      }}
      onMouseLeave={(e) => {
        if (!primary) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text)'
        }
      }}
    >
      {children}
    </button>
  )
}
