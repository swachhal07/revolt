import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes/AppRoutes'

/**
 * The router is unconditional now. The launch gate used to sit here, above it,
 * which meant it covered every address the app had — `/admin` included. It moved
 * into `AppRoutes` as a route element so it wraps the public branch only; see the
 * note there, and `GateGuard` for the gate logic itself, which is unchanged.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
