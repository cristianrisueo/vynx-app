import { useAccount, useConnect, useConnectors } from "wagmi";

export interface Strategy {
  label: string;
  pct: number;
  delay?: string;
}

export interface VaultCardProps {
  name: string;
  apy: string;
  sharePrice: string;
  strategies: Strategy[];
}

export default function VaultCard({
  name,
  apy,
  sharePrice,
  strategies,
}: VaultCardProps) {
  // TODO: useVault hook — replace mock data with on-chain reads
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();

  function handleDeposit() {
    if (!isConnected) {
      const injected = connectors[0];
      if (injected) connect({ connector: injected });
    }
    // TODO: open deposit modal when connected
  }

  return (
    <div
      className="vault-card"
      style={{
        padding: 56,
        display: "flex",
        flexDirection: "column",
        gap: 40,
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Vault name */}
      <div
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 40,
          letterSpacing: 3,
          lineHeight: 1,
          color: "var(--text)",
        }}
      >
        {name}
      </div>

      {/* APY — dominant element */}
      <div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          APY
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 56,
            letterSpacing: 1,
            lineHeight: 1,
            color: "var(--green)",
          }}
        >
          {apy}
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        {/* TODO: useVault hook for user position */}
        <StatItem label="Your Position" value="—" />
        <StatItem label="Share Price" value={sharePrice} />
      </div>

      {/* Strategy breakdown */}
      <div style={{ minHeight: 120 }}>
        {strategies.map((s, i) => (
          <div key={i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: 1,
                color: "var(--muted)",
                marginBottom: 6,
              }}
            >
              <span>{s.label}</span>
              <span>{s.pct}%</span>
            </div>
            <div
              style={{
                height: 2,
                background: "var(--border)",
                marginBottom: 12,
                position: "relative",
              }}
            >
              <div
                className="strategy-bar-fill"
                style={{
                  width: `${s.pct}%`,
                  animationDelay: s.delay ?? "0s",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <VaultButton deposit onClick={handleDeposit}>
          Deposit
        </VaultButton>
        <VaultButton>Withdraw</VaultButton>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 24,
          fontWeight: 500,
          color: "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function VaultButton({
  children,
  deposit,
  onClick,
}: {
  children: React.ReactNode;
  deposit?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        padding: 14,
        border: deposit ? "1px solid var(--gold)" : "1px solid #2E2E38",
        background: "transparent",
        color: deposit ? "var(--gold)" : "var(--text)",
        cursor: "pointer",
        textAlign: "center",
        transition: deposit
          ? "opacity 0.15s ease"
          : "border-color 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (deposit) {
          e.currentTarget.style.opacity = "0.75";
        } else {
          e.currentTarget.style.borderColor = "var(--gold)";
          e.currentTarget.style.color = "var(--gold)";
        }
      }}
      onMouseLeave={(e) => {
        if (deposit) {
          e.currentTarget.style.opacity = "1";
        } else {
          e.currentTarget.style.borderColor = "#2E2E38";
          e.currentTarget.style.color = "var(--text)";
        }
      }}
    >
      {children}
    </button>
  );
}
