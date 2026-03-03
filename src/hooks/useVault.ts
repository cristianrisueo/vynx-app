import { useReadContracts, useAccount } from "wagmi"
import { formatUnits, parseUnits } from "viem"
import type { Address } from "viem"
import { vaultAbi } from "@/abis/vault.abi"

// 1 WETH in wei — used as input to convertToAssets for share price calculation
const ONE_WETH = parseUnits("1", 18)

export interface UseVaultResult {
  tvl: string           // WETH formateado, ej. "1247.83"
  sharePrice: string    // WETH formateado con 4 dec., ej. "1.0421"
  userShares: bigint    // shares del usuario en raw
  userPosition: string  // WETH formateado, ej. "4.2031"
  isLoading: boolean
}

/**
 * useVault — reads core on-chain data from an ERC-4626 vault in a single multicall.
 * Refreshes every 60 seconds via the global useRefreshCycle.
 *
 * @param vaultAddress - Mainnet address of the ERC-4626 vault
 * @returns tvl, sharePrice, userShares, userPosition, isLoading
 */
export function useVault(vaultAddress: Address): UseVaultResult {
  const { address: userAddress } = useAccount()

  // Batch all reads into a single multicall
  const { data, isLoading } = useReadContracts({
    contracts: [
      // [0] Vault TVL in WETH
      {
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "totalAssets",
      },
      // [1] Share price: WETH value of 1 share (1e18 shares input)
      {
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "convertToAssets",
        args: [ONE_WETH],
      },
      // [2] User share balance (only meaningful when wallet is connected)
      {
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "balanceOf",
        args: [userAddress ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
    query: {
      staleTime: 60_000,
      // Without a wallet we still read TVL and sharePrice — userShares defaults to 0
    },
  })

  const totalAssets = (data?.[0]?.result ?? 0n) as bigint
  const sharePriceRaw = (data?.[1]?.result ?? ONE_WETH) as bigint
  const userShares = userAddress ? ((data?.[2]?.result ?? 0n) as bigint) : 0n

  // User position in WETH: shares × sharePrice / 1e18
  const userPositionWei = (userShares * sharePriceRaw) / ONE_WETH

  return {
    tvl: formatUnits(totalAssets, 18),
    sharePrice: formatUnits(sharePriceRaw, 18),
    userShares,
    userPosition: formatUnits(userPositionWei, 18),
    isLoading,
  }
}
