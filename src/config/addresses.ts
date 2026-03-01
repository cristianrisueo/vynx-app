// Direcciones de contratos deployados en Ethereum Mainnet
export const ADDRESSES = {
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  balanced: {
    vault:           "0x9D002dF2A5B632C0D8022a4738C1fa7465d88444",
    strategyManager: "0xa0d462b84C2431463bDACDC2C5bc3172FC927B0B",
    router:          "0x3286c0cB7Bbc7DD4cC7C8752E3D65e275E1B1044",
  },
  aggressive: {
    vault:           "0xA8cA9d84e35ac8F5af6F1D91fe4bE1C0BAf44296",
    strategyManager: "0xcCa54463BD2aEDF1773E9c3f45c6a954Aa9D9706",
    router:          "0xE898661760299f88e2B271a088987dacB8Fb3dE6",
  },
} as const

// Tokens soportados para zap deposit/withdraw
export const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: null as null, // ETH nativo
    decimals: 18,
    poolFee: null as null,
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}`,
    decimals: 18,
    poolFee: null as null,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
    decimals: 6,
    poolFee: 500,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" as `0x${string}`,
    decimals: 18,
    poolFee: 500,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" as `0x${string}`,
    decimals: 8,
    poolFee: 3000,
  },
] as const

export type TokenConfig = (typeof SUPPORTED_TOKENS)[number]
export type TokenSymbol = TokenConfig["symbol"]

// Quoter V2 de Uniswap V3 en Mainnet
export const QUOTER_V2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e" as const
