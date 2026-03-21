import { describe, it, expect, beforeEach } from 'vitest'
import { toast, openModal, closeModal } from '../ui.js'

describe('DOM UI Helpers', () => {
  beforeEach(() => {
    // Set up a basic DOM for testing
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="modal-test" class="modal">
        <div class="modal-content">Test Modal</div>
      </div>
    `
  })

  it('toast appends a div to the container', () => {
    toast('Hello Test', 'success')
    const container = document.getElementById('toast-container')
    const toastEl = container.querySelector('.toast')

    expect(toastEl).toBeTruthy()
    expect(toastEl.textContent).toBe('Hello Test')
    expect(toastEl.className).toContain('toast-success')
  })

  it('openModal adds "open" class', () => {
    openModal('modal-test')
    const modal = document.getElementById('modal-test')
    expect(modal.classList.contains('open')).toBe(true)
  })

  it('closeModal removes "open" class', () => {
    const modal = document.getElementById('modal-test')
    modal.classList.add('open')
    
    closeModal('modal-test')
    expect(modal.classList.contains('open')).toBe(false)
  })
})
