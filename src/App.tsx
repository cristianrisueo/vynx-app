import { useState } from 'react'
import Landing from './pages/Landing'
import Docs from './pages/Docs'

type Page = 'home' | 'docs'

function App() {
  const [page, setPage] = useState<Page>('home')

  if (page === 'docs') return <Docs setPage={setPage} />
  return <Landing setPage={setPage} />
}

export default App
