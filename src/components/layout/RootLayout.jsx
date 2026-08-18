import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

/** Shared chrome for every page. Pages render into <Outlet />. */
export default function RootLayout() {
  const { pathname } = useLocation()
  // The navbar is fixed and sits transparent over the home hero. Every other
  // page starts below it, so it needs the bar's height as top padding.
  const isHome = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className={isHome ? 'flex-1' : 'flex-1 pt-24'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
