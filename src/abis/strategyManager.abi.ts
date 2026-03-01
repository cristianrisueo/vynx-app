// ABI mínimo del StrategyManager de VynX
// Solo necesitamos getStrategies() para leer la lista de estrategias activas
export const strategyManagerAbi = [
  {
    name: "getStrategies",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
] as const
