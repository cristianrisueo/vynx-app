import { useQuery } from "@tanstack/react-query"
import { usePublicClient } from "wagmi"
import { formatUnits, parseAbiItem } from "viem"
import { ADDRESSES } from "@/config/addresses"

export type VaultTag = "balanced" | "aggressive"

export interface HarvestRow {
  vault: VaultTag
  strategy: string   // address truncada: "0x1234…abcd"
  profit: string     // WETH formateado con signo: "+0.842"
  keeper: string     // address truncada: "0x4f2a…c91e"
  blockNumber: bigint
  block: string      // número formateado: "21,847,203"
}

// Definición del evento como ABI item — viem infiere tipos de log.args
const HARVEST_EVENT = parseAbiItem(
  "event HarvestExecuted(address strategy, uint256 profit, address keeper, uint256 keeper_fee)"
)

// Trunca una address a formato "0x1234…abcd"
function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function useHarvests() {
  // Cliente viem desde el contexto de wagmi
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["harvests"],
    queryFn: async (): Promise<HarvestRow[]> => {
      if (!publicClient) return []

      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock - 10_000n

      // Obtener logs de ambos vaults en paralelo
      const [balancedLogs, aggressiveLogs] = await Promise.all([
        publicClient.getLogs({
          address: ADDRESSES.balanced.vault as `0x${string}`,
          event: HARVEST_EVENT,
          fromBlock,
          toBlock: currentBlock,
        }),
        publicClient.getLogs({
          address: ADDRESSES.aggressive.vault as `0x${string}`,
          event: HARVEST_EVENT,
          fromBlock,
          toBlock: currentBlock,
        }),
      ])

      // Convierte un log a HarvestRow
      const toRow =
        (vault: VaultTag) =>
        (log: (typeof balancedLogs)[number]): HarvestRow => {
          const args = log.args as {
            strategy: `0x${string}`
            profit: bigint
            keeper: `0x${string}`
            keeper_fee: bigint
          }
          const bn = log.blockNumber ?? 0n
          return {
            vault,
            strategy: truncateAddress(args.strategy),
            profit: `+${parseFloat(formatUnits(args.profit, 18)).toFixed(3)}`,
            keeper: truncateAddress(args.keeper),
            blockNumber: bn,
            block: bn.toLocaleString("en-US"),
          }
        }

      // Combinar, ordenar por bloque descendente y tomar los 5 más recientes
      return [
        ...balancedLogs.map(toRow("balanced")),
        ...aggressiveLogs.map(toRow("aggressive")),
      ]
        .sort((a, b) => (b.blockNumber > a.blockNumber ? 1 : -1))
        .slice(0, 5)
    },
    refetchInterval: 60_000, // más lento — getLogs es costoso en RPCs públicos
    staleTime: 30_000,
    enabled: !!publicClient,
  })
}
