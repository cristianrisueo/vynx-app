import { useHarvests } from "@/hooks/useHarvests"
import type { VaultTag } from "@/hooks/useHarvests"

function VaultBadge({ type }: { type: VaultTag }) {
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "var(--muted)",
      }}
    >
      {type === "balanced" ? "Balanced" : "Aggressive"}
    </span>
  );
}

export default function HarvestTable() {
  const { data: harvests, isLoading, isError } = useHarvests()

  return (
    <section style={{ padding: "50px 60px 50px" }}>
      {/* Encabezado de sección */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 40,
            letterSpacing: 2,
            lineHeight: 1,
            color: "var(--text)",
          }}
        >
          HARVEST HISTORY
        </div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: 14,
            color: "var(--muted)",
            margin: "10px 0 0",
          }}
        >
          Rewards automatically harvested and compounded. On-chain, verifiable.
        </p>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            {["Vault", "Strategy", "Profit (WETH)", "Keeper", "Block"].map(
              (col) => (
                <th
                  key={col}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "var(--text)",
                    padding: "16px 24px",
                    textAlign: "left",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {col}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {(!isLoading && !isError && harvests && harvests.length > 0)
            ? harvests.map((h, i) => (
              <tr key={i}>
                <td style={{ fontSize: 13, padding: "20px 24px" }}>
                  <VaultBadge type={h.vault} />
                </td>
                <td
                  style={{
                    fontSize: 13,
                    padding: "20px 24px",
                    color: "var(--muted)",
                  }}
                >
                  {h.strategy}
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    color: "var(--green)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  {h.profit}
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    color: "var(--muted)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                  }}
                >
                  {h.keeper}
                </td>
                <td
                  style={{
                    padding: "20px 24px",
                    color: "var(--muted)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                  }}
                >
                  {h.block}
                </td>
              </tr>
            ))
            : Array.from({ length: 5 }, (_, i) => (
              <tr key={`empty-${i}`}>
                {Array.from({ length: 5 }, (_, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "20px 24px",
                      color: "var(--muted)",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                    }}
                  >
                    —
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}
