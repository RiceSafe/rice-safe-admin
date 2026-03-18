// Toast Helpers
export function toast(msg, type = 'success') {
  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.textContent = msg
  document.getElementById('toast-container').appendChild(el)
  setTimeout(() => el.remove(), 3500)
}

// Modal Helpers
export function openModal(id) { document.getElementById(id).classList.add('open') }
export function closeModal(id) { document.getElementById(id).classList.remove('open') }

export function initModalClose() {
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open')
    }
  })
}

export function openDetailModal({ title, subtitle, image, content }) {
  document.getElementById('detail-title').textContent = title || ''
  document.getElementById('detail-subtitle').textContent = subtitle || ''

  const imgEl = document.getElementById('detail-image')
  if (image) {
    imgEl.src = image
    imgEl.style.display = 'block'
  } else {
    imgEl.src = ''
    imgEl.style.display = 'none'
  }

  document.getElementById('detail-content').innerHTML = content || ''
  openModal('modal-detail')
}

// Shared Render Helpers
export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function roleBadge(role) {
  const roleTh = { FARMER: 'ชาวนา', EXPERT: 'ผู้เชี่ยวชาญ', ADMIN: 'ผู้ดูแลระบบ' }[role] || role
  return `<span class="role-badge role-${role}">${roleTh}</span>`
}

export function verifiedBadge(isVerified) {
  return isVerified
    ? `<span class="badge badge-green">ตรวจสอบแล้ว</span>`
    : `<span class="badge badge-yellow">รอตรวจสอบ</span>`
}

export function activeBadge(isActive) {
  return isActive !== false
    ? `<span class="badge badge-green"><span class="dot"></span> กำลังระบาด</span>`
    : `<span class="badge" style="background:rgba(239,68,68,.15);color:var(--danger)"><span class="dot"></span> ยุติแล้ว</span>`
}
