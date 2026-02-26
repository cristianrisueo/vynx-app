// TODO: useHarvestEvents hook — replace mock data with on-chain event reads

type VaultTag = "balanced" | "aggressive";

interface HarvestEvent {
  vault: VaultTag;
  strategy: string;
  profit: string;
  keeper: string;
  block: string;
}

const HARVESTS: HarvestEvent[] = [
  {
    vault: "balanced",
    strategy: "Aave wstETH",
    profit: "+0.842",
    keeper: "0x4f2a…c91e",
    block: "21,847,203",
  },
  {
    vault: "aggressive",
    strategy: "Curve stETH",
    profit: "+1.204",
    keeper: "0x4f2a…c91e",
    block: "21,844,891",
  },
  {
    vault: "balanced",
    strategy: "Lido wstETH",
    profit: "+0.531",
    keeper: "0x7b1c…a34d",
    block: "21,841,502",
  },
  {
    vault: "aggressive",
    strategy: "Uniswap V3",
    profit: "+0.318",
    keeper: "0x4f2a…c91e",
    block: "21,838,774",
  },
  {
    vault: "balanced",
    strategy: "Curve stETH",
    profit: "+0.729",
    keeper: "0x9e3f…b82c",
    block: "21,835,113",
  },
];

function VaultTag({ type }: { type: VaultTag }) {
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
  return (
    <section style={{ padding: "50px 60px 50px" }}>
      {/* Section header */}
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
          {HARVESTS.map((h, i) => (
            <HarvestRow key={i} event={h} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function HarvestRow({ event: h }: { event: HarvestEvent }) {
  return (
    <tr>
      <td
        style={{
          fontSize: 13,
          padding: "20px 24px",
        }}
      >
        <VaultTag type={h.vault} />
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
  );
}
