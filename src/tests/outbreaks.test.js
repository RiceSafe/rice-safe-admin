import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadAdminOutbreaks } from '../pages/outbreaks.js'
import * as api from '../api.js'

vi.mock('../api.js', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  setToken: vi.fn()
}))

describe('Outbreaks Page Logic', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="page-outbreaks">
        <div class="card-header"></div>
      </div>
      <div id="outbreaks-table-body"></div>
    `
    vi.clearAllMocks()
  })

  it('loadAdminOutbreaks fetches and renders list', async () => {
    const mockData = [
      { id: 1, disease_name: 'Blast', latitude: 13.0, longitude: 100.0, is_active: true, is_verified: true }
    ]
    api.apiGet.mockResolvedValue(mockData)

    await loadAdminOutbreaks({ role: 'ADMIN' })

    expect(document.getElementById('outbreaks-table-body').innerHTML).toContain('Blast')
    expect(document.getElementById('outbreak-status-filter')).toBeTruthy()
  })
})
