// Minimal ABI for an individual VynX strategy
// Todas las estrategias exponen totalAssets() para reportar el WETH gestionado
export const strategyAbi = [
  {
    name: "totalAssets",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const
