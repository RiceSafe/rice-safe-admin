const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
let _token = ''

export function setToken(t) { _token = t }

function headers(json = true) {
  const h = { Authorization: `Bearer ${_token}` }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

async function handleResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const apiGet    = (path)       => fetch(`${API}${path}`, { headers: headers(false) }).then(handleResponse)
export const apiPost   = (path, body) => fetch(`${API}${path}`, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handleResponse)
export const apiPut    = (path, body) => fetch(`${API}${path}`, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handleResponse)
export const apiDelete = (path)       => fetch(`${API}${path}`, { method: 'DELETE', headers: headers(false) }).then(handleResponse)

// Multipart file upload (no Content-Type, browser sets it with boundary automatically)
export const apiUploadImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${API}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${_token}` },
    body: formData
  })
  return handleResponse(res)
}

// Public (no auth needed)
export const publicGet = (path) => fetch(`${API}${path}`).then(handleResponse)
