const ITEMS = [
  'WETH',
  'Lido stETH',
  'Aave v3',
  'Curve',
  'Uniswap V3',
  'ERC-4626',
  'Automated Rebalancing',
  'Non-Custodial',
  'Keeper System',
  'Harvest Automated',
]

function TickerContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i}>
          {item}
          {i < ITEMS.length - 1 && (
            <span
              style={{
                color: 'var(--gold)',
                margin: '0 24px',
              }}
            >
              ·
            </span>
          )}
        </span>
      ))}
      {/* Spacer before repeat */}
      <span style={{ margin: '0 48px' }} />
    </>
  )
}

export default function Ticker() {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          animation: 'ticker 30s linear infinite',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          letterSpacing: 2,
          color: 'var(--muted)',
        }}
      >
        <TickerContent />
        <TickerContent />
      </span>
    </div>
  )
}
