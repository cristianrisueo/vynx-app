import { useReadContract } from "wagmi"
import { aavePoolAbi } from "@/abis/aavePool.abi"
import { useStrategyAllocations } from "@/hooks/useStrategyAllocations"

// ── APYs base por estrategia en basis points (1 BPS = 0.01%) ────────────────
const LIDO_APY_BPS = 400    // 4.0% — APY histórico de Lido, actualizar si cambia
const CURVE_APY_BPS = 350   // 3.5% — APY Curve estimado, incluye CRV rewards
const UNISWAP_APY_BPS = 800 // 8.0% — APY Uniswap V3 estimado en rango ±10%

// APY de fallback cuando el vault está vacío (sin allocations activas)
const FALLBACK_APY: Record<"balanced" | "aggressive", number> = {
  balanced: 5.2,
  aggressive: 11.4,
}

// Aave V3 Pool en Mainnet
const AAVE_POOL_ADDRESS =
  "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as const

// wstETH en Mainnet — activo depositado por AaveStrategy
const WSTETH_ADDRESS =
  "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" as const

// Addresses de estrategias en lowercase para comparación sin checksum
const LIDO_ADDR    = "0xf8d1e54a07a47bb03833493eaeb7fe7432b53fcb"
const AAVE_ADDR    = "0x8135ed49fffeef4a1bb5909c5ba96eee9d4ed32a"
const CURVE_ADDR_1 = "0xf0c57c9c1974a14602074d85cfb1bc251b67dc00"
const CURVE_ADDR_2 = "0x312510b911fa47d55c9f1a055b1987d51853a7de"
const UNISWAP_ADDR = "0x653d9c2df3a32b872aea4e3b4e7436577c5eeb62"

// Devuelve APY en BPS para una estrategia dada su address
// aave_lending_bps: tasa de lending de Aave v3 en BPS, leída on-chain
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
  isEstimated: boolean // true si el vault está vacío y se usa fallback
  isLoading: boolean
}

export function useVaultAPY(
  strategyManagerAddress: `0x${string}`,
  tier: "balanced" | "aggressive",
): UseVaultAPYResult {
  // Allocations reales del vault
  const {
    strategies,
    totalAllocated,
    isLoading: alloc_loading,
  } = useStrategyAllocations(strategyManagerAddress)

  // Tasa de lending de Aave v3 para wstETH — refresca cada 5 minutos
  const { data: reserve_data, isLoading: aave_loading } = useReadContract({
    address: AAVE_POOL_ADDRESS,
    abi: aavePoolAbi,
    functionName: "getReserveData",
    args: [WSTETH_ADDRESS],
    query: {
      staleTime: 60_000,
      refetchInterval: 60_000,
    },
  })

  // currentLiquidityRate en RAY (1e27) → conversión a BPS
  // Number(rate) / 1e23 = BPS (ya que 1e27 / 1e4 = 1e23, con 1e4 BPS por unidad)
  const aave_lending_bps = reserve_data
    ? Math.round(Number(reserve_data.currentLiquidityRate) / 1e23)
    : 0

  // Vault vacío — devolver APY estimado hardcodeado con indicador isEstimated
  if (!alloc_loading && totalAllocated === 0n) {
    return {
      apy: FALLBACK_APY[tier],
      isEstimated: true,
      isLoading: false,
    }
  }

  // Aún cargando allocations o tasa de Aave
  if (alloc_loading || aave_loading) {
    return { apy: 0, isEstimated: false, isLoading: true }
  }

  // Calcular APY ponderado por allocation real
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
