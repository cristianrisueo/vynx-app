import { useVault } from "@/hooks/useVault"
import { useHarvests } from "@/hooks/useHarvests"
import { ADDRESSES } from "@/config/addresses"
import Skeleton from "./Skeleton"

// Formatea un valor en ETH: >1000 → "1.2K ETH", resto → "847.3 ETH"
// TODO: multiplicar por precio ETH/USD cuando se añada oracle de precio
function formatEth(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(3)}K ETH`
  }
  return `${value.toFixed(3)} ETH`
}

export default function MetricsStrip() {
  const balanced = useVault(ADDRESSES.balanced.vault as `0x${string}`)
  const aggressive = useVault(ADDRESSES.aggressive.vault as `0x${string}`)
  const { data: harvests, isLoading: harvestsLoading } = useHarvests()

  // TVL combinado de ambos vaults en ETH
  const isLoadingTvl = balanced.isLoading || aggressive.isLoading
  const tvlRaw = parseFloat(balanced.tvl) + parseFloat(aggressive.tvl)
  const tvlStr = isLoadingTvl ? null : formatEth(tvlRaw)

  // Suma de profit de todos los eventos en los últimos 10,000 bloques
  const totalProfit = harvests
    ? harvests.reduce((acc, h) => acc + parseFloat(h.profit.replace("+", "")), 0)
    : 0
  const harvestStr = harvestsLoading ? null : `${totalProfit.toFixed(3)} WETH`

  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      }}
    >
      {/* Total Value Locked */}
      <MetricCell label="Total Value Locked" value={tvlStr} borderRight>
        <span style={subStyle}>Across both vaults</span>
      </MetricCell>

      {/* Total Harvested */}
      <MetricCell label="Total Harvested" value={harvestStr} borderRight>
        <span style={subStyle}>Rewards compounded since deploy</span>
      </MetricCell>

      {/* Live Since — estático */}
      <MetricCell label="Live Since" value="Block 19,847,203">
        <a
          href="https://etherscan.io/block/19847203"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...subStyle,
            color: "var(--muted)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--muted)";
          }}
        >
          Verify on Etherscan
        </a>
      </MetricCell>
    </div>
  );
}

const subStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 300,
  fontSize: 12,
  color: "var(--muted)",
};

function MetricCell({
  label,
  value,
  borderRight,
  children,
}: {
  label: string;
  value: string | null;
  borderRight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "48px 60px",
        borderRight: borderRight ? "1px solid var(--border)" : "none",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 16,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 52,
          letterSpacing: 1,
          lineHeight: 1,
          color: "var(--text)",
        }}
      >
        {value === null ? <Skeleton width={180} height={52} /> : value}
      </div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}
