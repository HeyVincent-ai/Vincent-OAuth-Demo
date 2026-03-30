export async function vincentGet(path: string, token: string) {
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`GET ${path}`, res.status, body)
    throw new Error(`GET ${path} failed: ${res.status} — ${body}`)
  }
  return res.json()
}

export async function vincentPost(path: string, token: string, body: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error(`POST ${path}`, res.status, text)
    throw new Error(`POST ${path} failed: ${res.status} — ${text}`)
  }
  return res.json()
}
