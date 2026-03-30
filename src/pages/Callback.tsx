import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCode } from '../oauth'

export function Callback({
  clientId,
  onToken,
}: {
  clientId: string | null
  onToken: (token: string) => void
}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const exchanged = useRef(false)

  useEffect(() => {
    if (exchanged.current) return
    exchanged.current = true

    const code = searchParams.get('code')
    if (!code || !clientId) {
      setError('Missing code or client_id')
      return
    }

    exchangeCode(code, clientId)
      .then(({ accessToken }) => {
        onToken(accessToken)
        navigate('/app')
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p style={{ color: '#e74c3c' }}>Error: {error}</p>
  return <p style={{ color: '#999' }}>Exchanging code for token...</p>
}
