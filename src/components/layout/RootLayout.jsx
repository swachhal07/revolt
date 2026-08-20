import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'
import SmoothScroll from './SmoothScroll'

/** Shared chrome for every page. Pages render into <Outlet />. */
export default function RootLayout() {
  const { pathname } = useLocation()
  // The navbar is fixed and sits transparent over the home hero. Every other
  // page starts below it, so it needs the bar's height as top padding — and
  // that padding has to be the bar's *actual* height, not a round number near
  // it. `pt-24` was 96px against an 88px bar on a phone, which left an 8px
  // strip of page showing between the two with the bar's shadow falling across
  // it: a grey line ruled under the header on every page but home.
  //
  // The bar is `py-5` around a logo that is `h-12` below sm and `h-14` from it,
  // so it measures 88px and then 96px, and the padding now says exactly that.
  const isHome = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col">
      <SmoothScroll />
      <ScrollToTop />
      <Navbar />
      <main className={isHome ? 'flex-1' : 'flex-1 pt-[5.5rem] sm:pt-24'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
