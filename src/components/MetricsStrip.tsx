// TODO: replace mock data with useVault hook when contracts are deployed

export default function MetricsStrip() {
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
      <MetricCell label="Total Value Locked" value="$2.4M" borderRight>
        <span style={subStyle}>Across both vaults</span>
      </MetricCell>

      {/* Total Harvested */}
      <MetricCell label="Total Harvested" value="47.3 WETH" borderRight>
        <span style={subStyle}>Rewards compounded since deploy</span>
      </MetricCell>

      {/* Live Since */}
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
  value: string;
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
        {value}
      </div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}
