import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadUsers, saveRole } from '../pages/users.js'
import * as api from '../api.js'
import * as ui from '../ui.js'

// Mock API
vi.mock('../api.js', () => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  setToken: vi.fn()
}))

describe('Users Page Logic', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <select id="user-role-filter"><option value="">All</option></select>
      <div id="users-table-body"></div>
      <input id="role-user-id" value="123" />
      <select id="role-select"><option value="ADMIN">ADMIN</option></select>
      <div id="role-modal-sub"></div>
      <div id="modal-role"></div>
      <div id="toast-container"></div>
    `

    vi.spyOn(ui, 'toast')
    vi.spyOn(ui, 'openModal')
    vi.spyOn(ui, 'closeModal')
  })

  it('loadUsers renders a table with user data', async () => {
    const mockUsers = [
      { id: '1', username: 'alice', email: 'alice@test.com', role: 'ADMIN', created_at: '2024-01-01' }
    ]
    api.apiGet.mockResolvedValue(mockUsers)

    await loadUsers()

    const table = document.querySelector('table')
    expect(table).toBeTruthy()
    expect(table.innerHTML).toContain('alice')
    expect(table.innerHTML).toContain('ผู้ดูแลระบบ')
  })

  it('loadUsers shows empty state if no users found', async () => {
    api.apiGet.mockResolvedValue([])

    await loadUsers()

    const container = document.getElementById('users-table-body')
    expect(container.innerHTML).toContain('ไม่พบผู้ใช้งาน')
  })

  it('saveRole calls API and shows success toast', async () => {
    api.apiPut.mockResolvedValue({ success: true })
    
    await saveRole()

    expect(api.apiPut).toHaveBeenCalledWith('/users/123/role', { role: 'ADMIN' })
    expect(ui.toast).toHaveBeenCalledWith('อัปเดตสิทธิ์เรียบร้อยแล้ว')
    expect(ui.closeModal).toHaveBeenCalledWith('modal-role')
  })
})
