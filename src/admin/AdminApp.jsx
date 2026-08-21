import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { currentSession } from './data/session'
import Login from './Login'
import Shell from './Shell'
import Collection from './pages/Collection'
import Editor from './pages/Editor'
import Overview from './pages/Overview'
import { State } from './ui'

/**
 * Everything under `/admin`.
 *
 * Mounted outside the launch gate — see the note in `AppRoutes`. The two locks are
 * separate on purpose: the gate holds the public site shut until launch, and this
 * one holds the tool shut always, so whoever is loading the lineup this week does
 * not have to type the visitor's countdown key to get to work.
 *
 * The session is state here rather than read per-screen, so signing out takes
 * effect immediately everywhere instead of on the next navigation.
 */
export default function AdminApp() {
  const [session, setSession] = useState(currentSession)

  if (!session) return <Login onSignedIn={setSession} />

  return (
    <Shell onSignOut={() => setSession(null)}>
      <Routes>
        <Route index element={<Overview />} />
        {/* One pair of routes for every collection, rather than a pair per
            collection: `Collection` and `Editor` are generic and read the schema
            from the URL, so registering a new collection needs no route. */}
        <Route path=":collection" element={<Collection />} />
        <Route path=":collection/:id" element={<Editor />} />
        <Route
          path="*"
          element={<State kind="error" title="No such page" detail="Nothing is mounted at that address." />}
        />
      </Routes>
    </Shell>
  )
}
