import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

// Ciclo global de refresco — invalida todas las queries cada 60 segundos.
// Se llama una sola vez en App.tsx para sincronizar todos los datos on-chain.
export function useRefreshCycle() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries()
    }, 60_000)

    return () => clearInterval(interval)
  }, [queryClient])
}
