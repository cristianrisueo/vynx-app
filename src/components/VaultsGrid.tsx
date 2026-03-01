import VaultCard, { type VaultCardProps } from "./VaultCard";
import { ADDRESSES } from "@/config/addresses";

// Configuración de los vaults — addresses reales en Mainnet
// apy y strategies ya no son props — se calculan on-chain en VaultCard
const VAULTS: VaultCardProps[] = [
  {
    name: "Balanced",
    vaultAddress: ADDRESSES.balanced.vault as `0x${string}`,
    routerAddress: ADDRESSES.balanced.router as `0x${string}`,
    strategyManagerAddress: ADDRESSES.balanced.strategyManager as `0x${string}`,
    tier: "balanced",
  },
  {
    name: "Aggressive",
    vaultAddress: ADDRESSES.aggressive.vault as `0x${string}`,
    routerAddress: ADDRESSES.aggressive.router as `0x${string}`,
    strategyManagerAddress: ADDRESSES.aggressive.strategyManager as `0x${string}`,
    tier: "aggressive",
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
