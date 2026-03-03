import { useState } from 'react'
import Landing from './pages/Landing'
import Docs from './pages/Docs'
import { useRefreshCycle } from './hooks/useRefreshCycle'

type Page = 'home' | 'docs'

/**
 * App — root component. Manages top-level page routing via useState
 * and mounts the global 60-second on-chain refresh cycle.
 */
function App() {
  const [page, setPage] = useState<Page>('home')

  // Global refresh cycle — keeps all on-chain data synchronized every 60s
  useRefreshCycle()

  if (page === 'docs') return <Docs setPage={setPage} />
  return <Landing setPage={setPage} />
}

export default App
