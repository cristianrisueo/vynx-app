import { useReadContract, useReadContracts } from "wagmi"
import { strategyManagerAbi } from "@/abis/strategyManager.abi"
import { strategyAbi } from "@/abis/strategy.abi"

// Mapeo de addresses de estrategias a nombres legibles
// Comparar siempre en lowercase para evitar problemas con EIP-55 checksum
const STRATEGY_NAMES: Record<string, string> = {
  "0xf8d1e54a07a47bb03833493eaeb7fe7432b53fcb": "Lido (wstETH)",
  "0x8135ed49fffeef4a1bb5909c5ba96eee9d4ed32a": "Aave wstETH",
  "0xf0c57c9c1974a14602074d85cfb1bc251b67dc00": "Curve stETH",
  "0x312510b911fa47d55c9f1a055b1987d51853a7de": "Curve stETH",
  "0x653d9c2df3a32b872aea4e3b4e7436577c5eeb62": "Uniswap V3",
}

export interface StrategyAllocation {
  name: string       // nombre legible o address truncada
  address: string
  assets: bigint     // WETH depositados en la estrategia
  pct: number        // porcentaje del total (0-100)
}

export interface UseStrategyAllocationsResult {
  strategies: StrategyAllocation[]
  totalAllocated: bigint
  isLoading: boolean
}

export function useStrategyAllocations(
  strategyManagerAddress: `0x${string}`,
): UseStrategyAllocationsResult {
  // Paso 1: obtener la lista de estrategias activas del StrategyManager
  const { data: strategiesData, isLoading: strategiesLoading } = useReadContract({
    address: strategyManagerAddress,
    abi: strategyManagerAbi,
    functionName: "getStrategies",
    query: {
      staleTime: 60_000,
      refetchInterval: 60_000,
    },
  })

  const strategy_addresses =
    (strategiesData as `0x${string}`[] | undefined) ?? []

  // Paso 2: leer totalAssets() de cada estrategia en paralelo (multicall)
  const { data: assets_data, isLoading: assetsLoading } = useReadContracts({
    contracts: strategy_addresses.map((addr) => ({
      address: addr,
      abi: strategyAbi,
      functionName: "totalAssets",
    })),
    query: {
      enabled: strategy_addresses.length > 0,
      refetchInterval: 60_000,
      staleTime: 60_000,
    },
  })

  // Si aún no hay datos (o falla la llamada), usar 0n como fallback para cada estrategia
  const assets_by_index: bigint[] =
    assets_data?.map((d) => (d.result as bigint | undefined) ?? 0n) ??
    strategy_addresses.map(() => 0n)

  // Paso 3: calcular total y porcentajes
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
