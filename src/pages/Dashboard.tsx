import { useEffect, useState } from 'react'
import { vincentGet, vincentPost } from '../api'

const card: React.CSSProperties = {
  background: '#1a1a2e',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
}
const btn: React.CSSProperties = {
  padding: '8px 16px',
  background: '#6c5ce7',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  marginRight: 8,
}

export function Dashboard({ token }: { token: string }) {
  const [balance, setBalance] = useState<any>(null)
  const [market, setMarket] = useState<any>(null)
  const [betResult, setBetResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      vincentGet('/api/skills/polymarket/balance', token),
      vincentGet('/api/skills/polymarket/markets?query=Bitcoin', token),
    ])
      .then(async ([bal, mkts]) => {
        setBalance(bal)
        const inner = mkts.data || mkts
        const list = Array.isArray(inner) ? inner : inner.markets || []
        if (list.length > 0) {
          const m = list[0]
          // Fetch market detail to get token IDs
          const detail = await vincentGet(
            `/api/skills/polymarket/market/${m.conditionId}`,
            token
          )
          const marketDetail = detail.data || detail
          // unwrap: {market: {...}} → {...}
          const unwrapped = marketDetail.market || marketDetail
          console.log('Market detail:', JSON.stringify(unwrapped, null, 2))
          setMarket(unwrapped)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  const placeBet = async (outcomeIndex: number) => {
    if (!market) return
    setBetResult(null)
    setError('')
    try {
      const tokens = market.tokens || []
      const tokenId = tokens[outcomeIndex]?.token_id || ''
      console.log('Betting with tokenId:', tokenId)
      const res = await fetch('/api/skills/polymarket/bet', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, side: 'BUY', amount: 10 }),
      })
      const data = await res.json()
      // Any response with a body from Vincent means the request reached the trading engine
      setBetResult(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return <p style={{ color: '#999' }}>Loading...</p>

  return (
    <div>
      <div style={card}>
        <h3 style={{ marginBottom: 8, fontSize: 15 }}>USDC Balance</h3>
        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#aaa' }}>
          {JSON.stringify(balance, null, 2)}
        </pre>
      </div>

      {market && (
        <div style={card}>
          <h3 style={{ marginBottom: 8, fontSize: 15 }}>Place Bet</h3>
          <p style={{ fontSize: 13, color: '#aaa', marginBottom: 12 }}>
            {market.question || market.title}
          </p>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Bet $10 USDC on:
          </p>
          <button
            style={{ ...btn, background: '#27ae60' }}
            onClick={() => placeBet(0)}
          >
            BUY YES
          </button>
          <button
            style={{ ...btn, background: '#e74c3c' }}
            onClick={() => placeBet(1)}
          >
            BUY NO
          </button>
        </div>
      )}

      {betResult && (
        <div style={{ ...card, background: '#1a2e1a', border: '1px solid #27ae60' }}>
          <h3 style={{ marginBottom: 8, fontSize: 15, color: '#27ae60' }}>Success — Trade Reached Vincent</h3>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#aaa', margin: 0 }}>
            {betResult}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ ...card, background: '#2a1a1a', overflow: 'hidden' }}>
          <h3 style={{ marginBottom: 8, fontSize: 15, color: '#e74c3c' }}>Error</h3>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#e74c3c', margin: 0 }}>
            {error}
          </pre>
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: '#555' }}>
        Token: {token.slice(0, 16)}... (stored in memory only)
      </p>
    </div>
  )
}
