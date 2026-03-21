import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadPendingVerification, verifyOutbreak } from '../pages/verify.js'
import * as api from '../api.js'
import * as ui from '../ui.js'

vi.mock('../api.js', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  setToken: vi.fn()
}))

describe('Verification Page Logic', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="verify-table-body"></div>
      <div id="dash-row-1"></div>
      <div id="verify-row-1"></div>
    `
    vi.spyOn(ui, 'toast')
  })

  it('loadPendingVerification filters unverified outbreaks', async () => {
    api.apiGet.mockResolvedValue([
      { id: 1, disease_name: 'Rice Blast', is_verified: false },
      { id: 2, disease_name: 'Brown Spot', is_verified: true }
    ])

    await loadPendingVerification({ role: 'EXPERT' })

    const html = document.getElementById('verify-table-body').innerHTML
    expect(html).toContain('Rice Blast')
    expect(html).not.toContain('Brown Spot')
  })

  it('verifyOutbreak calls correct endpoint', async () => {
    api.apiPost.mockResolvedValue({ success: true })
    
    await verifyOutbreak(1, null, { role: 'EXPERT' })

    expect(api.apiPost).toHaveBeenCalledWith('/outbreaks/1/verify', {})
    expect(ui.toast).toHaveBeenCalledWith('ยืนยันการระบาดแล้ว')
  })
})
