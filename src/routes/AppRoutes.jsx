import { Route, Routes } from 'react-router-dom'
import RootLayout from '@/components/layout/RootLayout'
import Home from '@/pages/Home'
import Motorcycles from '@/pages/Motorcycles'
import MotorcycleDetail from '@/pages/MotorcycleDetail'
import Dealers from '@/pages/Dealers'
import Blog from '@/pages/Blog'
import BlogPost from '@/pages/BlogPost'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import EmiCalculator from '@/pages/EmiCalculator'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import NotFound from '@/pages/NotFound'

/** Every route in the site. Add new pages here. */
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="motorcycles" element={<Motorcycles />} />
        <Route path="motorcycles/:slug" element={<MotorcycleDetail />} />
        <Route path="dealers" element={<Dealers />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="emi-calculator" element={<EmiCalculator />} />
        {/* The two the footer has been linking at since it was written. Paths
            match the `to` values in `Footer.jsx` — until now both fell through
            to NotFound. */}
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
