import { useReadContract } from "wagmi"
import { aavePoolAbi } from "@/abis/aavePool.abi"
import { useStrategyAllocations } from "@/hooks/useStrategyAllocations"

// ── Base APYs per strategy in basis points (1 BPS = 0.01%) ─────────────────
const LIDO_APY_BPS = 400    // 4.0% — historical Lido APY, update if it changes
const CURVE_APY_BPS = 350   // 3.5% — estimated Curve APY, includes CRV rewards
const UNISWAP_APY_BPS = 800 // 8.0% — estimated Uniswap V3 APY in a ±10% price range

// Fallback APY displayed when the vault has no active allocations
const FALLBACK_APY: Record<"balanced" | "aggressive", number> = {
  balanced: 5.2,
  aggressive: 11.4,
}

// Aave V3 Pool on Mainnet
const AAVE_POOL_ADDRESS =
  "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as const

// wstETH on Mainnet — the asset deposited by AaveStrategy
const WSTETH_ADDRESS =
  "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" as const

// Strategy addresses in lowercase for checksum-agnostic comparison
const LIDO_ADDR    = "0xf8d1e54a07a47bb03833493eaeb7fe7432b53fcb"
const AAVE_ADDR    = "0x8135ed49fffeef4a1bb5909c5ba96eee9d4ed32a"
const CURVE_ADDR_1 = "0xf0c57c9c1974a14602074d85cfb1bc251b67dc00"
const CURVE_ADDR_2 = "0x312510b911fa47d55c9f1a055b1987d51853a7de"
const UNISWAP_ADDR = "0x653d9c2df3a32b872aea4e3b4e7436577c5eeb62"

/**
 * Returns the base APY in basis points for a given strategy address.
 * For the Aave strategy, the live Aave lending rate is added on top of the Lido base.
 *
 * @param address - Strategy contract address (any casing)
 * @param aave_lending_bps - Current Aave V3 wstETH lending rate in basis points
 */
function get_strategy_apy_bps(
  address: string,
  aave_lending_bps: number,
): number {
  const addr = address.toLowerCase()
  if (addr === LIDO_ADDR) return LIDO_APY_BPS
  if (addr === AAVE_ADDR) return LIDO_APY_BPS + aave_lending_bps // yield stacking
  if (addr === CURVE_ADDR_1 || addr === CURVE_ADDR_2) return CURVE_APY_BPS
  if (addr === UNISWAP_ADDR) return UNISWAP_APY_BPS
  return 0
}

export interface UseVaultAPYResult {
  apy: number          // APY ponderado en porcentaje, ej. 5.24
  isEstimated: boolean // true when the vault is empty and the fallback APY is used
  isLoading: boolean
}

/**
 * useVaultAPY — computes the weighted average APY for a vault by combining
 * per-strategy base APYs with their real allocation percentages from on-chain data.
 * The Aave wstETH lending rate is read live from the Aave V3 Pool.
 *
 * @param strategyManagerAddress - Mainnet address of the StrategyManager contract
 * @param tier - Risk tier identifier ('balanced' | 'aggressive')
 * @returns apy (percentage), isEstimated (true when vault is empty), isLoading
 */
export function useVaultAPY(
  strategyManagerAddress: `0x${string}`,
  tier: "balanced" | "aggressive",
): UseVaultAPYResult {
  // Live strategy allocations from the StrategyManager
  const {
    strategies,
    totalAllocated,
    isLoading: alloc_loading,
  } = useStrategyAllocations(strategyManagerAddress)

  // Aave V3 lending rate for wstETH
  const { data: reserve_data, isLoading: aave_loading } = useReadContract({
    address: AAVE_POOL_ADDRESS,
    abi: aavePoolAbi,
    functionName: "getReserveData",
    args: [WSTETH_ADDRESS],
    query: {
      staleTime: 60_000,
    },
  })

  // currentLiquidityRate is in RAY (1e27) — divide by 1e23 to get BPS
  // 1e27 / 1e4 BPS_per_unit = 1e23 → Number(rate) / 1e23 gives BPS
  const aave_lending_bps = reserve_data
    ? Math.round(Number(reserve_data.currentLiquidityRate) / 1e23)
    : 0

  // Empty vault — return hardcoded fallback APY with isEstimated flag
  if (!alloc_loading && totalAllocated === 0n) {
    return {
      apy: FALLBACK_APY[tier],
      isEstimated: true,
      isLoading: false,
    }
  }

  // Still loading allocations or the Aave rate
  if (alloc_loading || aave_loading) {
    return { apy: 0, isEstimated: false, isLoading: true }
  }

  // Compute weighted APY by actual allocation percentages
  let weighted_apy_bps = 0
  for (const strategy of strategies) {
    const strategy_bps = get_strategy_apy_bps(strategy.address, aave_lending_bps)
    weighted_apy_bps += strategy_bps * (strategy.pct / 100)
  }

  return {
    apy: weighted_apy_bps / 100,
    isEstimated: false,
    isLoading: false,
  }
}
