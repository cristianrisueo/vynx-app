import { useVault } from "@/hooks/useVault"
import { useHarvests } from "@/hooks/useHarvests"
import { ADDRESSES } from "@/config/addresses"
import Skeleton from "./Skeleton"

// Mainnet block at which the VynX protocol was deployed
const DEPLOYMENT_BLOCK = 19_847_203

// TODO: multiply by ETH/USD spot price once a price oracle is integrated
function formatEth(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K ETH`
  }
  return `${value.toFixed(2)} ETH`
}

/**
 * MetricsStrip — horizontal bar showing three protocol-level metrics:
 * combined TVL across both vaults, total WETH harvested, and deployment block.
 */
export default function MetricsStrip() {
  const balanced = useVault(ADDRESSES.balanced.vault as `0x${string}`)
  const aggressive = useVault(ADDRESSES.aggressive.vault as `0x${string}`)
  const { data: harvests, isLoading: harvestsLoading } = useHarvests()

  // Combined TVL across both vaults in ETH
  const isLoadingTvl = balanced.isLoading || aggressive.isLoading
  const tvlRaw = parseFloat(balanced.tvl) + parseFloat(aggressive.tvl)
  const tvlStr = isLoadingTvl ? null : formatEth(tvlRaw)

  // Sum of profit from all harvest events in the lookback window
  const totalProfit = harvests
    ? harvests.reduce((acc, h) => acc + parseFloat(h.profit.replace("+", "")), 0)
    : 0
  const harvestStr = harvestsLoading ? null : `${totalProfit.toFixed(2)} WETH`

  return (
    <div
      className="metrics-strip"
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

      {/* Live Since — static deployment block */}
      <MetricCell label="Live Since" value={`Block ${DEPLOYMENT_BLOCK.toLocaleString("en-US")}`}>
        <a
          href={`https://etherscan.io/block/${DEPLOYMENT_BLOCK}`}
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

/**
 * MetricCell — individual metric display within the MetricsStrip.
 *
 * @param label - Uppercase mono label
 * @param value - Formatted value string, or null while loading (renders Skeleton)
 * @param borderRight - Whether to render a right border separator
 * @param children - Subtitle or link rendered below the value
 */
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
      className="metric-cell"
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
