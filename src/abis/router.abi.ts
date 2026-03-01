// ABI del Router periférico de VynX
// Cada vault tiene su propio router deployado — no recibe vaultAddress como parámetro
export const routerAbi = [
  {
    name: "zapDepositETH",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "zapDepositERC20",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token",        type: "address" },
      { name: "amount",       type: "uint256" },
      { name: "poolFee",      type: "uint24"  },
      { name: "min_weth_out", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "zapWithdrawETH",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "zapWithdrawERC20",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "shares",         type: "uint256" },
      { name: "token",          type: "address" },
      { name: "poolFee",        type: "uint24"  },
      { name: "min_token_out",  type: "uint256" },
    ],
    outputs: [],
  },
] as const
