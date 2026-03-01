import { useState } from "react"
import { useAccount, useConnect, useConnectors } from "wagmi"
import type { Address } from "viem"
import { useVault } from "@/hooks/useVault"
import DepositModal from "./DepositModal"
import WithdrawModal from "./WithdrawModal"

export interface Strategy {
  label: string;
  pct: number;
  delay?: string;
}

export interface VaultCardProps {
  name: string;
  apy: string;
  vaultAddress: Address;
  routerAddress: Address;
  strategies: Strategy[];
}

export default function VaultCard({
  name,
  apy,
  vaultAddress,
  routerAddress,
  strategies,
}: VaultCardProps) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();

  // Datos on-chain del vault
  // TODO: calcular APY desde share price histórico cuando haya datos suficientes
  const { sharePrice, userPosition, isLoading } = useVault(vaultAddress)

  // Estado de los modales
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  function handleDeposit() {
    if (!isConnected) {
      const injected = connectors[0]
      if (injected) connect({ connector: injected })
      return
    }
    setDepositOpen(true)
  }

  function handleWithdraw() {
    if (!isConnected) {
      const injected = connectors[0]
      if (injected) connect({ connector: injected })
      return
    }
    setWithdrawOpen(true)
  }

  // Formatea la posición del usuario: "—" si 0, "X.XXXX WETH" si tiene
  const userPositionFormatted =
    isLoading || parseFloat(userPosition) === 0
      ? "—"
      : `${parseFloat(userPosition).toFixed(4)} WETH`

  const sharePriceFormatted = isLoading
    ? "—"
    : parseFloat(sharePrice).toFixed(4)

  return (
    <>
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
        {/* Nombre del vault */}
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

        {/* APY — elemento dominante */}
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
          <StatItem label="Your Position" value={userPositionFormatted} />
          <StatItem label="Share Price" value={sharePriceFormatted} />
        </div>

        {/* Desglose de estrategias */}
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

        {/* Acciones */}
        <div style={{ display: "flex", gap: 12 }}>
          <VaultButton deposit onClick={handleDeposit}>
            Deposit
          </VaultButton>
          <VaultButton onClick={handleWithdraw}>Withdraw</VaultButton>
        </div>
      </div>

      {/* Modales — hacen createPortal internamente al document.body */}
      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        vaultAddress={vaultAddress}
        routerAddress={routerAddress}
        vaultName={name}
      />
      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        vaultAddress={vaultAddress}
        routerAddress={routerAddress}
        vaultName={name}
      />
    </>
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
