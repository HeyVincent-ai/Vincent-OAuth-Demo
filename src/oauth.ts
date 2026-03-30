const VINCENT_BASE = 'https://heyvincent.ai'
const REDIRECT_URI = window.location.origin + '/callback'

function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return crypto.subtle.digest('SHA-256', encoder.encode(plain))
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  bytes.forEach((b) => (str += String.fromCharCode(b)))
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// --- App Registration ---

export async function registerApp(appName: string): Promise<string> {
  const res = await fetch('/api/oauth/public/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: appName,
      redirect_uris: [REDIRECT_URI],
    }),
  })
  if (!res.ok) throw new Error(`Registration failed: ${res.status}`)
  const data = await res.json()
  return data.client_id
}

// --- PKCE OAuth Flow ---

export async function startAuth(clientId: string) {
  const codeVerifier = generateRandomString(64)
  sessionStorage.setItem('pkce_code_verifier', codeVerifier)

  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64urlEncode(hashed)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'all',
    resource: VINCENT_BASE,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  // Direct browser navigation — no CORS issue
  window.location.href = `${VINCENT_BASE}/api/oauth/public/authorize?${params}`
}

// --- Token Exchange ---

export async function exchangeCode(
  code: string,
  clientId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
  if (!codeVerifier) throw new Error('Missing code_verifier')

  const res = await fetch('/api/oauth/public/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
    }),
  })

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`)
  const data = await res.json()

  sessionStorage.removeItem('pkce_code_verifier')

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}
