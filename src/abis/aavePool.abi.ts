// ABI del Pool de Aave V3 en Mainnet
// Dirección: 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
// Solo necesitamos getReserveData para leer currentLiquidityRate del wstETH
export const aavePoolAbi = [
  {
    name: "getReserveData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          {
            name: "configuration",
            type: "tuple",
            components: [{ name: "data", type: "uint256" }],
          },
          { name: "liquidityIndex",              type: "uint128" },
          { name: "currentLiquidityRate",        type: "uint128" },
          { name: "variableBorrowIndex",         type: "uint128" },
          { name: "currentVariableBorrowRate",   type: "uint128" },
          { name: "currentStableBorrowRate",     type: "uint128" },
          { name: "lastUpdateTimestamp",         type: "uint40"  },
          { name: "id",                          type: "uint16"  },
          { name: "aTokenAddress",               type: "address" },
          { name: "stableDebtTokenAddress",      type: "address" },
          { name: "variableDebtTokenAddress",    type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury",           type: "uint128" },
          { name: "unbacked",                    type: "uint128" },
          { name: "isolationModeTotalDebt",      type: "uint128" },
        ],
      },
    ],
  },
] as const
