import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadCommunity } from '../pages/community.js'
import * as api from '../api.js'

vi.mock('../api.js', () => ({
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
  setToken: vi.fn()
}))

describe('Community Page Logic', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="community-table-body"></div>
    `
    vi.clearAllMocks()
  })

  it('loadCommunity fetches and renders posts', async () => {
    api.apiGet.mockResolvedValue([
      { id: 1, author_name: 'John', content: 'Help my rice!' }
    ])

    await loadCommunity({ role: 'ADMIN' })

    const html = document.getElementById('community-table-body').innerHTML
    expect(html).toContain('John')
    expect(html).toContain('Help my rice!')
  })

  it('aborts for non-admin', async () => {
    await loadCommunity({ role: 'EXPERT' })
    expect(api.apiGet).not.toHaveBeenCalled()
  })
})
