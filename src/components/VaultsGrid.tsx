import VaultCard, { type VaultCardProps } from "./VaultCard";
import { ADDRESSES } from "@/config/addresses";

// Configuración estática de los vaults — addresses reales en Mainnet
// sharePrice y userPosition ya no son props — los lee VaultCard desde useVault
const VAULTS: VaultCardProps[] = [
  {
    name: "Balanced",
    apy: "5.2%", // TODO: calcular APY desde share price histórico
    vaultAddress: ADDRESSES.balanced.vault as `0x${string}`,
    routerAddress: ADDRESSES.balanced.router as `0x${string}`,
    strategies: [
      { label: "Lido (wstETH)", pct: 45 },
      { label: "Aave wstETH", pct: 35, delay: "0.1s" },
      { label: "Curve stETH", pct: 20, delay: "0.2s" },
    ],
  },
  {
    name: "Aggressive",
    apy: "11.4%", // TODO: calcular APY desde share price histórico
    vaultAddress: ADDRESSES.aggressive.vault as `0x${string}`,
    routerAddress: ADDRESSES.aggressive.router as `0x${string}`,
    strategies: [
      { label: "Curve stETH", pct: 60 },
      { label: "Uniswap V3", pct: 40, delay: "0.1s" },
    ],
  },
];

export default function VaultsGrid() {
  return (
    <section>
      {/* Grid de dos columnas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
        }}
      >
        {VAULTS.map((v) => (
          <VaultCard key={v.name} {...v} />
        ))}
      </div>
    </section>
  );
}
