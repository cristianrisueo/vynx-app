import { useReadContracts, useAccount } from "wagmi"
import { formatUnits, parseUnits } from "viem"
import type { Address } from "viem"
import { vaultAbi } from "@/abis/vault.abi"

// 1 WETH en wei — se usa para calcular el share price actual
const ONE_WETH = parseUnits("1", 18)

export interface UseVaultResult {
  tvl: string           // WETH formateado, ej. "1247.83"
  sharePrice: string    // WETH formateado con 4 dec., ej. "1.0421"
  userShares: bigint    // shares del usuario en raw
  userPosition: string  // WETH formateado, ej. "4.2031"
  isLoading: boolean
}

export function useVault(vaultAddress: Address): UseVaultResult {
  const { address: userAddress } = useAccount()

  // Batching de lecturas en una sola llamada multicall
  const { data, isLoading } = useReadContracts({
    contracts: [
      // [0] TVL del vault en WETH
      {
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "totalAssets",
      },
      // [1] Share price: cuánto WETH vale 1 share (1e18 shares)
      {
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "convertToAssets",
        args: [ONE_WETH],
      },
      // [2] Shares del usuario (solo si hay wallet conectada)
      {
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "balanceOf",
        args: [userAddress ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
    query: {
      refetchInterval: 30_000,
      staleTime: 15_000,
      // Si no hay wallet, igual leemos TVL y sharePrice — solo userShares será 0
    },
  })

  const totalAssets = (data?.[0]?.result ?? 0n) as bigint
  const sharePriceRaw = (data?.[1]?.result ?? ONE_WETH) as bigint
  const userShares = userAddress ? ((data?.[2]?.result ?? 0n) as bigint) : 0n

  // Posición del usuario en WETH: shares * sharePrice / 1e18
  const userPositionWei = (userShares * sharePriceRaw) / ONE_WETH

  return {
    tvl: formatUnits(totalAssets, 18),
    sharePrice: formatUnits(sharePriceRaw, 18),
    userShares,
    userPosition: formatUnits(userPositionWei, 18),
    isLoading,
  }
}
