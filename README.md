# VynX Frontend

The official interface for the VynX yield aggregator protocol.

## Overview

VynX is a non-custodial yield aggregator deployed on Ethereum Mainnet. It routes deposited WETH across a curated set of DeFi strategies — Lido, Aave, Curve, and Uniswap V3 — and automatically compounds harvested rewards on behalf of depositors. The protocol exposes two ERC-4626 compliant vaults: a Balanced tier targeting lower-volatility yield, and an Aggressive tier allocating more weight to higher-risk strategies.

This repository contains the frontend interface. It connects directly to the deployed contracts, reads all data from Ethereum Mainnet via an Alchemy RPC endpoint, and requires no backend or indexer.

## Live

https://vynx.finance

## Protocol Contracts

### Balanced Tier

| Contract        | Address                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Vault           | [0x9D002dF2A5B632C0D8022a4738C1fa7465d88444](https://etherscan.io/address/0x9D002dF2A5B632C0D8022a4738C1fa7465d88444)            |
| StrategyManager | [0xa0d462b84C2431463bDACDC2C5bc3172FC927B0B](https://etherscan.io/address/0xa0d462b84C2431463bDACDC2C5bc3172FC927B0B)            |
| Router          | [0x3286c0cB7Bbc7DD4cC7C8752E3D65e275E1B1044](https://etherscan.io/address/0x3286c0cB7Bbc7DD4cC7C8752E3D65e275E1B1044)            |

### Aggressive Tier

| Contract        | Address                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Vault           | [0xA8cA9d84e35ac8F5af6F1D91fe4bE1C0BAf44296](https://etherscan.io/address/0xA8cA9d84e35ac8F5af6F1D91fe4bE1C0BAf44296)            |
| StrategyManager | [0xcCa54463BD2aEDF1773E9c3f45c6a954Aa9D9706](https://etherscan.io/address/0xcCa54463BD2aEDF1773E9c3f45c6a954Aa9D9706)            |
| Router          | [0xE898661760299f88e2B271a088987dacB8Fb3dE6](https://etherscan.io/address/0xE898661760299f88e2B271a088987dacB8Fb3dE6)            |

## Tech Stack

- React 19 + Vite 7 + TypeScript 5.9
- wagmi v3 + viem v2 — Ethereum wallet and contract interactions
- @tanstack/react-query v5 — async state management and cache invalidation
- Tailwind CSS v3 — utility-first styling
- Alchemy — Mainnet RPC provider

## Architecture

```
src/
  abis/             Contract ABIs (vault, router, strategyManager, strategy, erc20, quoter, aavePool)
  config/           Contract addresses and supported token list
  hooks/            On-chain data hooks (useVault, useHarvests, useVaultAPY, useStrategyAllocations, useRefreshCycle, useDebounce)
  components/       UI components (Navbar, Hero, MetricsStrip, VaultsGrid, VaultCard, HarvestTable, DepositModal, WithdrawModal, Footer, Skeleton)
  pages/            Page-level components (Landing, Docs)
  App.tsx           Root component — page routing and global refresh cycle
  main.tsx          Entry point — WagmiProvider and QueryClientProvider setup
```

## Getting Started

### Prerequisites

- Node.js 20+
- An Alchemy API key (https://alchemy.com)

### Installation

```bash
git clone https://github.com/cristianrisueo/vynx
cd vynx/app
npm install
```

### Environment Variables

Create a `.env` file in the `app/` directory:

```
VITE_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<YOUR_API_KEY>
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Key Design Decisions

**wagmi v3 over ethers.js.** wagmi provides first-class React hooks for wallet state, contract reads, and transaction lifecycle, with React Query as the underlying async layer. This eliminates most of the boilerplate that would otherwise be needed with ethers.js and makes cache invalidation straightforward.

**useState navigation over react-router-dom.** The app has two pages (Landing and Docs). A full router dependency would be disproportionate for this scope. A single `page` state variable in `App.tsx` handles routing without adding bundle weight or requiring URL-based navigation.

**Synchronized 60-second refresh cycle.** Rather than each hook managing its own polling interval, a single `useRefreshCycle` hook in `App.tsx` calls `queryClient.invalidateQueries()` every 60 seconds. All hooks use `staleTime: 60_000`, so they refetch in sync on the next render after invalidation. This prevents waterfall refetches and keeps the UI consistent.

**Modal portal architecture.** Both `DepositModal` and `WithdrawModal` render into `document.body` via `createPortal`, ensuring they sit above all page content in the stacking context regardless of where they are used in the component tree.

**Weighted APY from on-chain data.** APY is not hardcoded. `useVaultAPY` reads the live strategy allocations from the StrategyManager, reads the Aave V3 wstETH lending rate from the Aave Pool, and computes a weighted average APY across all active strategies. When a vault has no allocations (vault is empty), a clearly labeled fallback estimate is displayed.

## Supported Tokens

| Symbol | Name             | Mainnet Address                              | Decimals |
| ------ | ---------------- | -------------------------------------------- | -------- |
| ETH    | Ethereum         | native                                       | 18       |
| WETH   | Wrapped Ether    | 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2   | 18       |
| USDC   | USD Coin         | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48   | 6        |
| DAI    | Dai Stablecoin   | 0x6B175474E89094C44Da98b954EedeAC495271d0F   | 18       |
| WBTC   | Wrapped Bitcoin  | 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599   | 8        |

Non-WETH tokens are routed through the Uniswap V3 Router periphery. The Uniswap V3 Quoter V2 (`0x61fFE014bA17989E743c5F6cB21bF9697530B21e`) is used to fetch expected output amounts before submission.

## License

MIT
