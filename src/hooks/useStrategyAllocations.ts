import { useReadContract, useReadContracts } from "wagmi"
import { strategyManagerAbi } from "@/abis/strategyManager.abi"
import { strategyAbi } from "@/abis/strategy.abi"

// Human-readable names for known strategy addresses
// Always compare in lowercase to avoid EIP-55 checksum mismatches
const STRATEGY_NAMES: Record<string, string> = {
  "0xf8d1e54a07a47bb03833493eaeb7fe7432b53fcb": "Lido (wstETH)",
  "0x8135ed49fffeef4a1bb5909c5ba96eee9d4ed32a": "Aave wstETH",
  "0xf0c57c9c1974a14602074d85cfb1bc251b67dc00": "Curve stETH",
  "0x312510b911fa47d55c9f1a055b1987d51853a7de": "Curve stETH",
  "0x653d9c2df3a32b872aea4e3b4e7436577c5eeb62": "Uniswap V3",
}

export interface StrategyAllocation {
  name: string       // human-readable name or truncated address
  address: string
  assets: bigint     // WETH deposited into this strategy
  pct: number        // percentage of total allocated (0–100)
}

export interface UseStrategyAllocationsResult {
  strategies: StrategyAllocation[]
  totalAllocated: bigint
  isLoading: boolean
}

/**
 * useStrategyAllocations — fetches the list of active strategies from a StrategyManager
 * and reads each strategy's totalAssets via multicall to compute allocation percentages.
 *
 * @param strategyManagerAddress - Mainnet address of the StrategyManager contract
 * @returns strategies (with name, address, assets, pct), totalAllocated, isLoading
 */
export function useStrategyAllocations(
  strategyManagerAddress: `0x${string}`,
): UseStrategyAllocationsResult {
  // Step 1: fetch the list of active strategies from the StrategyManager
  const { data: strategiesData, isLoading: strategiesLoading } = useReadContract({
    address: strategyManagerAddress,
    abi: strategyManagerAbi,
    functionName: "getStrategies",
    query: {
      staleTime: 60_000,
    },
  })

  const strategy_addresses =
    (strategiesData as `0x${string}`[] | undefined) ?? []

  // Step 2: read totalAssets() from each strategy in parallel via multicall
  const { data: assets_data, isLoading: assetsLoading } = useReadContracts({
    contracts: strategy_addresses.map((addr) => ({
      address: addr,
      abi: strategyAbi,
      functionName: "totalAssets",
    })),
    query: {
      enabled: strategy_addresses.length > 0,
      staleTime: 60_000,
    },
  })

  // Fall back to 0n for each strategy if data is missing or the call failed
  const assets_by_index: bigint[] =
    assets_data?.map((d) => (d.result as bigint | undefined) ?? 0n) ??
    strategy_addresses.map(() => 0n)

  // Step 3: compute total allocated and per-strategy percentages
  const total_allocated = assets_by_index.reduce((sum, a) => sum + a, 0n)

  const strategies: StrategyAllocation[] = strategy_addresses.map((addr, i) => {
    const strategy_assets = assets_by_index[i] ?? 0n
    const pct =
      total_allocated > 0n
        ? Number((strategy_assets * 10_000n) / total_allocated) / 100
        : 0

    return {
      name: STRATEGY_NAMES[addr.toLowerCase()] ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`,
      address: addr,
      assets: strategy_assets,
      pct,
    }
  })

  return {
    strategies,
    totalAllocated: total_allocated,
    isLoading: strategiesLoading || (strategy_addresses.length > 0 && assetsLoading),
  }
}
