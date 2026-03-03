import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MetricsStrip from '@/components/MetricsStrip'
import VaultsGrid from '@/components/VaultsGrid'
import HarvestTable from '@/components/HarvestTable'
import Footer from '@/components/Footer'

type Page = 'home' | 'docs'

/**
 * Landing — main page layout composed of all landing sections in order:
 * Navbar → Hero → MetricsStrip → VaultsGrid → HarvestTable → Footer.
 *
 * @param setPage - Callback to navigate to a different page
 */
export default function Landing({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navbar />
      <Hero setPage={setPage} />
      <MetricsStrip />
      <VaultsGrid />
      <HarvestTable />
      <Footer />
    </div>
  )
}
