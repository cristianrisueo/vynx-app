import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import "./index.css";
import App from "./App.tsx";

const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
