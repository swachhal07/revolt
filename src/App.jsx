import { useCallback, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '@/routes/AppRoutes'
import LaunchGate from '@/components/gate/LaunchGate'
import { isUnlocked } from '@/utils/gate'

export default function App() {
  // Resolved during the first render, not in an effect: once launch has passed
  // the site paints straight through instead of flashing the gate for a frame.
  //
  // State only, with nothing behind it — a key typed on the gate holds for this
  // page load and no longer, so a reload lands back on the countdown.
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const open = useCallback(() => setUnlocked(true), [])

  // The router stays unmounted behind the gate. It is not merely hidden — the
  // whole site sits under it, so mounting it would run every page's effects
  // (Lenis, scroll listeners, video preloads) for a screen nobody can see.
  if (!unlocked) return <LaunchGate onUnlock={open} />

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
