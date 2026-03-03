import VaultCard, { type VaultCardProps } from "./VaultCard";
import { ADDRESSES } from "@/config/addresses";

// Vault configuration — live Mainnet addresses
// apy and strategies are not props — computed on-chain inside VaultCard
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

/**
 * VaultsGrid — renders the two vault cards (Balanced and Aggressive)
 * in a responsive two-column grid.
 */
export default function VaultsGrid() {
  return (
    <section>
      {/* Two-column grid — single column on mobile */}
      <div
        className="vaults-grid"
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
