// TODO: useHarvestEvents hook — replace mock data with on-chain event reads

type VaultTag = 'balanced' | 'aggressive'

interface HarvestEvent {
  vault: VaultTag
  strategy: string
  profit: string
  keeper: string
  block: string
}

const HARVESTS: HarvestEvent[] = [
  { vault: 'balanced',   strategy: 'Aave wstETH',  profit: '+0.842', keeper: '0x4f2a…c91e', block: '21,847,203' },
  { vault: 'aggressive', strategy: 'Curve stETH',   profit: '+1.204', keeper: '0x4f2a…c91e', block: '21,844,891' },
  { vault: 'balanced',   strategy: 'Lido wstETH',   profit: '+0.531', keeper: '0x7b1c…a34d', block: '21,841,502' },
  { vault: 'aggressive', strategy: 'Uniswap V3',    profit: '+0.318', keeper: '0x4f2a…c91e', block: '21,838,774' },
  { vault: 'balanced',   strategy: 'Curve stETH',   profit: '+0.729', keeper: '0x9e3f…b82c', block: '21,835,113' },
]

const TAG_STYLES: Record<VaultTag, React.CSSProperties> = {
  balanced: {
    color: '#60A5FA',
    borderColor: '#60A5FA40',
    background: '#60A5FA10',
  },
  aggressive: {
    color: 'var(--gold)',
    borderColor: 'var(--gold-dim)',
    background: 'var(--gold-dim)',
  },
}

function VaultTag({ type }: { type: VaultTag }) {
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        letterSpacing: 1,
        textTransform: 'uppercase',
        padding: '4px 10px',
        border: '1px solid',
        ...TAG_STYLES[type],
      }}
    >
      {type === 'balanced' ? 'Balanced' : 'Aggressive'}
    </span>
  )
}

export default function HarvestTable() {
  return (
    <section style={{ padding: '0 60px 120px' }}>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 64,
        }}
      >
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48,
            letterSpacing: 2,
            color: 'var(--text)',
          }}
        >
          Harvest History
        </h2>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: 1,
            color: 'var(--muted)',
          }}
        >
          Last 5 events
        </span>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            {['Vault', 'Strategy', 'Profit (WETH)', 'Keeper', 'Block'].map((col) => (
              <th
                key={col}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  padding: '16px 24px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HARVESTS.map((h, i) => (
            <HarvestRow key={i} event={h} />
          ))}
        </tbody>
      </table>
    </section>
  )
}

function HarvestRow({ event: h }: { event: HarvestEvent }) {
  return (
    <tr
      style={{ cursor: 'default' }}
      onMouseEnter={(e) => {
        Array.from(e.currentTarget.querySelectorAll('td')).forEach(
          (td) => ((td as HTMLElement).style.background = 'var(--surface)')
        )
      }}
      onMouseLeave={(e) => {
        Array.from(e.currentTarget.querySelectorAll('td')).forEach(
          (td) => ((td as HTMLElement).style.background = 'transparent')
        )
      }}
    >
      <td style={{ fontSize: 13, padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <VaultTag type={h.vault} />
      </td>
      <td style={{ fontSize: 13, padding: '20px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
        {h.strategy}
      </td>
      <td
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          color: 'var(--green)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
        }}
      >
        {h.profit}
      </td>
      <td
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          color: 'var(--muted)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
        }}
      >
        {h.keeper}
      </td>
      <td
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          color: 'var(--muted)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
        }}
      >
        {h.block}
      </td>
    </tr>
  )
}
