import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadDiseases, openDiseaseModal, saveDisease } from '../pages/diseases.js'
import * as api from '../api.js'
import * as ui from '../ui.js'

vi.mock('../api.js', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  publicGet: vi.fn(),
  apiUploadImage: vi.fn(),
  setToken: vi.fn()
}))

describe('Diseases Page Logic', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="diseases-table-body"></div>
      <button id="add-disease-btn"></button>
      <select id="disease-category-filter">
        <option value="">ทุกหมวดหมู่</option>
      </select>

      <div id="modal-disease">
        <input id="disease-id" />
        <input id="disease-name" />
        <input id="disease-alias" />
        <input id="disease-category" />
        <input id="disease-image-url" />
        <img id="disease-image-preview" />
        <textarea id="disease-description"></textarea>
        <textarea id="disease-spread"></textarea>
        <input id="disease-weather" />
        <textarea id="disease-symptoms"></textarea>
        <textarea id="disease-prevention"></textarea>
        <textarea id="disease-treatment"></textarea>
        <div id="disease-modal-title"></div>
      </div>
    `
    vi.spyOn(ui, 'toast')
    vi.spyOn(ui, 'openModal')
    vi.spyOn(ui, 'closeModal')
  })

  it('loadDiseases renders table and populates filter', async () => {
    api.publicGet.mockImplementation((path) => {
      if (path === '/diseases') return Promise.resolve([
        { id: 1, name: 'Blast', category: 'Fungal' }
      ])
      if (path === '/diseases/categories') return Promise.resolve(['Fungal', 'Bacterial'])
      return Promise.resolve([])
    })

    await loadDiseases()

    expect(document.getElementById('diseases-table-body').innerHTML).toContain('Blast')
    const filter = document.getElementById('disease-category-filter')
    expect(filter.innerHTML).toContain('Fungal')
    expect(filter.innerHTML).toContain('Bacterial')
  })

  it('saveDisease handles update correctly', async () => {
    document.getElementById('disease-id').value = '123'
    document.getElementById('disease-name').value = 'Updated Name'
    document.getElementById('disease-alias').value = 'alias'
    document.getElementById('disease-category').value = 'cat'
    
    api.apiPut.mockResolvedValue({ success: true })
    api.publicGet.mockResolvedValue([]) // for reload

    await saveDisease()

    expect(api.apiPut).toHaveBeenCalledWith('/diseases/123', expect.objectContaining({
      name: 'Updated Name'
    }))
    expect(ui.toast).toHaveBeenCalledWith('อัปเดตข้อมูลโรคข้าวแล้ว')
  })
})
