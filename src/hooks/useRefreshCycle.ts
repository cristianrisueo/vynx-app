import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

/**
 * useRefreshCycle — mounts a global 60-second interval that invalidates
 * all React Query caches, keeping on-chain data synchronized across the app.
 * Called once in App.tsx at the root level.
 */
// Global refresh cycle — invalidates all queries every 60 seconds.
export function useRefreshCycle() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries()
    }, 60_000)

    return () => clearInterval(interval)
  }, [queryClient])
}
