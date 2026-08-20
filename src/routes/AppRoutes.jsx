import { Route, Routes } from 'react-router-dom'
import AdminApp from '@/admin/AdminApp'
import GateGuard from '@/components/gate/GateGuard'
import RootLayout from '@/components/layout/RootLayout'
import Home from '@/pages/Home'
import Motorcycles from '@/pages/Motorcycles'
import MotorcycleDetail from '@/pages/MotorcycleDetail'
import Dealers from '@/pages/Dealers'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/BlogPost'
import About from '@/pages/About'
import Leadership from '@/pages/Leadership'
import Contact from '@/pages/Contact'
import EmiCalculator from '@/pages/EmiCalculator'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import NotFound from '@/pages/NotFound'

/** Every route in the site. Add new pages here. */
export default function AppRoutes() {
  return (
    <Routes>
      {/* The back office, and the one branch the launch countdown does not cover.
          It sits above `GateGuard` rather than inside it because the two locks
          answer different questions: the gate holds the public site shut until the
          25th, and the admin's own sign-in holds the tool shut permanently.
          Nesting them would mean whoever is loading the lineup this week has to
          type the visitor's countdown key before they can get to work.

          `/*` because `AdminApp` has its own `Routes` inside it — without the
          splat, only `/admin` itself would match and every screen under it would
          fall through to the site's NotFound. */}
      <Route path="admin/*" element={<AdminApp />} />

      {/* Everything public, behind the countdown. */}
      <Route element={<GateGuard />}>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="motorcycles" element={<Motorcycles />} />
          <Route path="motorcycles/:slug" element={<MotorcycleDetail />} />
          <Route path="dealers" element={<Dealers />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="about" element={<About />} />
          <Route path="leadership" element={<Leadership />} />
          <Route path="contact" element={<Contact />} />
          <Route path="emi-calculator" element={<EmiCalculator />} />
          {/* The two the footer has been linking at since it was written. Paths
              match the `to` values in `Footer.jsx` — until now both fell through
              to NotFound. */}
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}
