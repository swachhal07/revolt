import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes/AppRoutes'

/** The router, and nothing above it. Every route lives in `AppRoutes`. */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
