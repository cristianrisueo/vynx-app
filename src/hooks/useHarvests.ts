import { useQuery } from "@tanstack/react-query"
import { usePublicClient } from "wagmi"
import { formatUnits, parseAbiItem } from "viem"
import { ADDRESSES } from "@/config/addresses"

export type VaultTag = "balanced" | "aggressive"

export interface HarvestRow {
  vault: VaultTag
  strategy: string   // truncated address: "0x1234…abcd"
  profit: string     // formatted WETH with sign: "+0.842"
  keeper: string     // truncated address: "0x4f2a…c91e"
  blockNumber: bigint
  block: string      // formatted block number: "21,847,203"
}

// Number of blocks to look back when fetching harvest logs (~36 hours at 12s/block)
const HARVEST_LOOKBACK_BLOCKS = 10_000n

// ABI item for the HarvestExecuted event — viem infers log.args types from this
const HARVEST_EVENT = parseAbiItem(
  "event HarvestExecuted(address strategy, uint256 profit, address keeper, uint256 keeper_fee)"
)

/** Truncates an address to the "0x1234…abcd" display format. */
function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/**
 * useHarvests — fetches the 5 most recent HarvestExecuted events
 * from both vaults over the last ~36 hours (~10,000 blocks).
 *
 * @returns React Query result containing an array of HarvestRow records
 */
export function useHarvests() {
  // viem public client from the wagmi context
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ["harvests"],
    queryFn: async (): Promise<HarvestRow[]> => {
      if (!publicClient) return []

      const currentBlock = await publicClient.getBlockNumber()
      const fromBlock = currentBlock - HARVEST_LOOKBACK_BLOCKS

      // Fetch logs from both vaults in parallel
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

      // Maps a raw log to a HarvestRow
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

      // Merge, sort descending by block, keep the 5 most recent
      return [
        ...balancedLogs.map(toRow("balanced")),
        ...aggressiveLogs.map(toRow("aggressive")),
      ]
        .sort((a, b) => (b.blockNumber > a.blockNumber ? 1 : -1))
        .slice(0, 5)
    },
    staleTime: 60_000,
    enabled: !!publicClient,
  })
}
