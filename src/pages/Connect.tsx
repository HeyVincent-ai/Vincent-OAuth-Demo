import { useState } from 'react'
import { registerApp, startAuth } from '../oauth'

const btn: React.CSSProperties = {
  padding: '10px 20px',
  background: '#6c5ce7',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
}

export function Connect({
  clientId,
  onClientId,
}: {
  clientId: string | null
  onClientId: (id: string) => void
}) {
  const [status, setStatus] = useState('')

  const handleRegister = async () => {
    try {
      setStatus('Registering app...')
      const id = await registerApp('Milady Demo')
      onClientId(id)
      setStatus(`Registered! client_id: ${id.slice(0, 12)}...`)
    } catch (e: any) {
      setStatus(`Error: ${e.message}`)
    }
  }

  const handleConnect = () => {
    if (!clientId) return
    startAuth(clientId)
  }

  return (
    <div>
      {!clientId ? (
        <>
          <p style={{ marginBottom: 12, color: '#999' }}>
            Step 1: Register this app with Vincent
          </p>
          <button style={btn} onClick={handleRegister}>
            Register App
          </button>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 12, color: '#999' }}>
            App registered. Connect your Vincent account via OAuth.
          </p>
          <button style={btn} onClick={handleConnect}>
            Connect Vincent
          </button>
        </>
      )}
      {status && (
        <p style={{ marginTop: 12, fontSize: 13, color: '#aaa' }}>{status}</p>
      )}
    </div>
  )
}
