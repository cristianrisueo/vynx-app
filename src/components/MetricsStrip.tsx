// TODO: replace mock data with useVault hook when contracts are deployed

interface Metric {
  label: string
  value: string
  sub: string
  green?: boolean
}

const METRICS: Metric[] = [
  { label: 'Total Value Locked', value: '$2.4M', sub: 'Across both vaults' },
  { label: 'Balanced APY', value: '5.2%', sub: 'Lido + Aave + Curve', green: true },
  { label: 'Aggressive APY', value: '11.4%', sub: 'Curve + Uniswap V3', green: true },
]

export default function MetricsStrip() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
      }}
    >
      {METRICS.map((m, i) => (
        <div
          key={i}
          className="metric-card"
          style={{
            padding: '48px 60px',
            borderRight: i < METRICS.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 16,
            }}
          >
            {m.label}
          </div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 52,
              letterSpacing: 1,
              lineHeight: 1,
              color: m.green ? 'var(--green)' : 'var(--text)',
            }}
          >
            {m.value}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              marginTop: 8,
            }}
          >
            {m.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
