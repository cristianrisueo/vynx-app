import { useState, useEffect } from "react"

/**
 * useDebounce — delays propagating a value until it has stopped changing
 * for the specified number of milliseconds. Used to throttle expensive
 * operations (e.g. Quoter RPC calls) while the user is typing.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns The debounced value, updated only after the delay has elapsed
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
