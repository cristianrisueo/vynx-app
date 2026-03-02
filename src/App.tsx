import { useState } from 'react'
import Landing from './pages/Landing'
import Docs from './pages/Docs'
import { useRefreshCycle } from './hooks/useRefreshCycle'

type Page = 'home' | 'docs'

function App() {
  const [page, setPage] = useState<Page>('home')

  // Ciclo global de refresco — sincroniza todos los datos on-chain cada 60s
  useRefreshCycle()

  if (page === 'docs') return <Docs setPage={setPage} />
  return <Landing setPage={setPage} />
}

export default App
