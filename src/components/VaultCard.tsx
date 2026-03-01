import { useState } from "react";
import { useAccount, useConnect, useConnectors } from "wagmi";
import type { Address } from "viem";
import { useVault } from "@/hooks/useVault";
import { useStrategyAllocations } from "@/hooks/useStrategyAllocations";
import { useVaultAPY } from "@/hooks/useVaultAPY";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";
import Skeleton from "./Skeleton";

export interface VaultCardProps {
  name: string;
  vaultAddress: Address;
  routerAddress: Address;
  strategyManagerAddress: Address;
  tier: "balanced" | "aggressive";
}

export default function VaultCard({
  name,
  vaultAddress,
  routerAddress,
  strategyManagerAddress,
  tier,
}: VaultCardProps) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const connectors = useConnectors();

  // Datos on-chain del vault (TVL, share price, posición del usuario)
  const {
    sharePrice,
    userPosition,
    isLoading: vault_loading,
  } = useVault(vaultAddress);

  // Allocations reales desde el StrategyManager
  const {
    strategies: strategy_allocations,
    totalAllocated,
    isLoading: alloc_loading,
  } = useStrategyAllocations(strategyManagerAddress);

  // APY ponderado por allocation real
  const {
    apy,
    isEstimated,
    isLoading: apy_loading,
  } = useVaultAPY(strategyManagerAddress, tier);

  // Estado de los modales
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  function handleDeposit() {
    if (!isConnected) {
      const injected = connectors[0];
      if (injected) connect({ connector: injected });
      return;
    }
    setDepositOpen(true);
  }

  function handleWithdraw() {
    if (!isConnected) {
      const injected = connectors[0];
      if (injected) connect({ connector: injected });
      return;
    }
    setWithdrawOpen(true);
  }

  // Formatea la posición del usuario: "—" si 0 o cargando
  const user_position_formatted =
    vault_loading || parseFloat(userPosition) === 0
      ? "—"
      : `${parseFloat(userPosition).toFixed(4)} WETH`;

  const share_price_formatted = vault_loading
    ? null
    : parseFloat(sharePrice).toFixed(4);

  // Display del APY: skeleton si carga, "~X.X%" si estimado, "X.X%" si real
  const apy_display = apy_loading
    ? null
    : `${isEstimated ? "~" : ""}${apy.toFixed(1)}%`;

  // Vault vacío y no cargando allocations
  const vault_vacio = !alloc_loading && totalAllocated === 0n;

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
            {apy_display === null ? <Skeleton width={140} height={56} /> : apy_display}
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
          <StatItem label="Your Position" value={user_position_formatted} />
          <StatItem label="Share Price" value={share_price_formatted} />
        </div>

        {/* Desglose de estrategias — datos reales del StrategyManager */}
        <div style={{ minHeight: 120 }}>
          {/* Vault vacío sin allocations */}
          {vault_vacio && (
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "var(--muted)",
                paddingTop: 8,
              }}
            >
              No funds allocated yet
            </div>
          )}

          {/* Barras de estrategia */}
          {!vault_vacio &&
            strategy_allocations.map((s, i) => (
              <div key={s.address}>
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
                  <span>{s.name}</span>
                  <span>{alloc_loading ? "—" : `${s.pct.toFixed(0)}%`}</span>
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
                      width: alloc_loading ? "0%" : `${s.pct}%`,
                      animationDelay: `${i * 0.1}s`,
                      opacity: alloc_loading ? 0.3 : 1,
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

function StatItem({ label, value }: { label: string; value: string | null }) {
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
        {value === null ? <Skeleton width={100} height={24} /> : value}
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
