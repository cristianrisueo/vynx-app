import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MetricsStrip from '@/components/MetricsStrip'
import VaultsGrid from '@/components/VaultsGrid'
import HarvestTable from '@/components/HarvestTable'
import Footer from '@/components/Footer'

function App() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <MetricsStrip />
      <VaultsGrid />
      <HarvestTable />
      <Footer />
    </div>
  )
}

export default App
