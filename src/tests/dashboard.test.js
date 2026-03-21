import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadDashboard } from '../pages/dashboard.js'
import * as api from '../api.js'

vi.mock('../api.js', () => ({
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
  publicGet: vi.fn(),
  setToken: vi.fn()
}))

describe('Dashboard Page Logic', () => {
  const currentUser = { role: 'ADMIN', username: 'admin' }

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="stat-diseases">0</div>
      <div id="stat-outbreaks">0</div>
      <div id="stat-pending">0</div>
      <div id="stat-users">0</div>
      <div id="dashboard-outbreaks-body"></div>
    `
    vi.clearAllMocks()
  })

  it('loadDashboard fetches data and updates stats', async () => {
    api.publicGet.mockResolvedValue([{ id: 1 }, { id: 2 }]) // 2 diseases
    api.apiGet.mockImplementation((path) => {
      if (path === '/outbreaks') return Promise.resolve([
        { id: 10, is_verified: false, is_active: true }, // pending & active
        { id: 11, is_verified: true, is_active: true }   // verified & active
      ])
      if (path === '/users') return Promise.resolve([{ id: 1 }, { id: 2 }, { id: 3 }])
      return Promise.resolve([])
    })

    await loadDashboard(currentUser)

    expect(document.getElementById('stat-diseases').textContent).toBe('2')
    expect(document.getElementById('stat-outbreaks').textContent).toBe('2')
    expect(document.getElementById('stat-pending').textContent).toBe('1')
    expect(document.getElementById('stat-users').textContent).toBe('3')
  })

  it('hides user stats for non-admin', async () => {
    api.publicGet.mockResolvedValue([])
    api.apiGet.mockResolvedValue([])
    
    await loadDashboard({ role: 'EXPERT', username: 'expert' })

    expect(document.getElementById('stat-users').textContent).toBe('0') // Not updated from initial
    expect(api.apiGet).not.toHaveBeenCalledWith('/users')
  })
})
