import VaultCard, { type VaultCardProps } from './VaultCard'

// TODO: useVault hook — replace mock data with on-chain reads
const VAULTS: VaultCardProps[] = [
  {
    name: 'Balanced',
    apy: '5.2%',
    tvl: '$1.2M',
    sharePrice: '1.042',
    strategies: [
      { label: 'Lido (wstETH)', pct: 45 },
      { label: 'Aave wstETH', pct: 35, delay: '0.1s' },
      { label: 'Curve stETH', pct: 20, delay: '0.2s' },
    ],
  },
  {
    name: 'Aggressive',
    apy: '11.4%',
    tvl: '$1.2M',
    sharePrice: '1.089',
    strategies: [
      { label: 'Curve stETH', pct: 60 },
      { label: 'Uniswap V3', pct: 40, delay: '0.1s' },
    ],
  },
]

export default function VaultsGrid() {
  return (
    <section style={{ padding: '120px 60px' }}>
      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          background: 'var(--border)',
        }}
      >
        {VAULTS.map((v) => (
          <VaultCard key={v.name} {...v} />
        ))}
      </div>
    </section>
  )
}
