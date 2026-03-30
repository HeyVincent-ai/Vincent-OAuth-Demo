import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Connect } from './pages/Connect'
import { Callback } from './pages/Callback'
import { Dashboard } from './pages/Dashboard'

export function App() {
  const [token, setToken] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(
    () => localStorage.getItem('vincent_client_id')
  )

  const saveClientId = (id: string) => {
    localStorage.setItem('vincent_client_id', id)
    setClientId(id)
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 24, fontSize: 20 }}>Milady x Vincent Demo</h1>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/app" />
            ) : (
              <Connect clientId={clientId} onClientId={saveClientId} />
            )
          }
        />
        <Route
          path="/callback"
          element={<Callback clientId={clientId} onToken={setToken} />}
        />
        <Route
          path="/app"
          element={
            token ? <Dashboard token={token} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </div>
  )
}
