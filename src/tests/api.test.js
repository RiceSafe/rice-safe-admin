import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setToken, apiGet, apiPost } from '../api.js'

describe('API Helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    setToken('') // Reset token
  })

  it('apiGet sends correct headers and token', async () => {
    setToken('test-token')
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'ok' })
    })

    const result = await apiGet('/test')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token'
        }
      })
    )
    expect(result.data).toBe('ok')
  })

  it('apiPost sends body and content-type', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    const body = { name: 'New Disease' }
    await apiPost('/diseases', body)

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(body)
      })
    )
  })

  it('throws error on non-ok response', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' })
    })

    await expect(apiGet('/private')).rejects.toThrow('Unauthorized')
  })

  it('throws default error message if json fails', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Syntax error'))
    })

    await expect(apiGet('/bad')).rejects.toThrow('HTTP 500')
  })
})
