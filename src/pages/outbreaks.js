import { apiGet, apiPost, apiDelete } from '../api.js'
import { toast, openModal, closeModal, fmtDate, verifiedBadge, activeBadge, openDetailModal } from '../ui.js'

let _allOutbreaks = []
let _currentUser  = null

export async function loadAdminOutbreaks(currentUser) {
  _currentUser = currentUser
  document.getElementById('outbreaks-table-body').innerHTML = `<div class="loading">กำลังโหลด…</div>`
  try {
    _allOutbreaks = await apiGet('/outbreaks')
    renderFilterControls()
    applyFilter()
  } catch {
    document.getElementById('outbreaks-table-body').innerHTML =
      `<div class="empty-state">โหลดข้อมูลล้มเหลว</div>`
  }
}

function renderFilterControls() {
  const header = document.querySelector('#page-outbreaks .card-header')
  if (!header.querySelector('#outbreak-status-filter')) {
    const sel = document.createElement('select')
    sel.id = 'outbreak-status-filter'
    sel.style.cssText = 'padding:8px 12px;font-size:13px;width:auto;'
    sel.innerHTML = `
      <option value="active">กำลังระบาด</option>
      <option value="all">ทั้งหมด</option>
      <option value="resolved">ยุติแล้ว</option>`
    sel.addEventListener('change', applyFilter)
    header.appendChild(sel)
  }
}

function applyFilter() {
  const filter = document.getElementById('outbreak-status-filter')?.value || 'active'
  let filtered = _allOutbreaks
  if (filter === 'active')   filtered = _allOutbreaks.filter(o => o.is_active !== false)
  if (filter === 'resolved') filtered = _allOutbreaks.filter(o => o.is_active === false)
  renderOutbreakTable(filtered, _currentUser)
}

function renderOutbreakTable(outbreaks, currentUser) {
  const el = document.getElementById('outbreaks-table-body')
  const isExpert = currentUser.role === 'EXPERT'
  const isAdmin  = currentUser.role === 'ADMIN'

  if (!outbreaks.length) {
    el.innerHTML = `<div class="empty-state">ไม่พบบันทึกการระบาด</div>`
    return
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th style="width:50px;">รูป</th>
          <th>โรคข้าว</th>
          <th>สถานที่</th>
          <th>สถานะ</th>
          <th>ยืนยัน</th>
          <th>วันที่</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        ${outbreaks.map(o => `
          <tr id="outbreak-row-${o.id}">
            <td><img src="${o.image_url || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=No+Img'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"/></td>
            <td><strong>${o.disease_name || 'ไม่ทราบชื่อโรค'}</strong></td>
            <td style="color:var(--muted)">${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)}</td>
            <td>${activeBadge(o.is_active)}</td>
            <td>${verifiedBadge(o.is_verified)}</td>
            <td style="color:var(--muted)">${fmtDate(o.created_at)}</td>
            <td>
              <div class="table-actions">
                ${isExpert && o.is_verified && o.is_active !== false
                  ? `<button class="btn btn-ghost btn-sm" data-action="resolve" data-id="${o.id}">ยุติการระบาด</button>`
                  : ''}
                ${isAdmin || isExpert
                  ? `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${o.id}">ลบรายการ</button>`
                  : ''}
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`

  el.querySelectorAll('[data-action="resolve"]').forEach(btn => {
    btn.addEventListener('click', () => confirmResolveOutbreak(btn.dataset.id, currentUser))
  })
  el.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => confirmDeleteOutbreak(btn.dataset.id, currentUser))
  })

  // Click row to view details
  el.querySelectorAll('tbody tr').forEach((row, index) => {
    row.style.cursor = 'pointer'
    row.addEventListener('click', (e) => {
      if (e.target.closest('button')) return
      const o = outbreaks[index]
      openDetailModal({
        title: o.disease_name || 'ไม่ทราบชื่อโรค',
        subtitle: `${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)} — ${fmtDate(o.created_at)}`,
        image: o.image_url,
        content: `<strong>สถานะ:</strong> ${o.is_active ? 'กำลังระบาด' : 'ยุติการระบาด'}<br/><strong>การตรวจสอบ:</strong> ${o.is_verified ? 'ตรวจสอบแล้วโดยผู้เชี่ยวชาญ' : 'รอการตรวจสอบ'}`
      })
    })
  })
}

function resetConfirmBtn() {
  document.getElementById('confirm-btn').className   = 'btn btn-danger'
  document.getElementById('confirm-btn').textContent = 'ลบรายการ'
}

function confirmResolveOutbreak(id, currentUser) {
  document.getElementById('confirm-title').textContent = 'ยุติการระบาด?'
  document.getElementById('confirm-msg').textContent   =
    'เป็นการยืนยันว่าการระบาดในพื้นที่นี้ยุติลงแล้ว ข้อมูลนี้จะอัปเดตบนแผนที่ของชาวนาทันที'
  document.getElementById('confirm-btn').textContent   = 'ยืนยัน'
  document.getElementById('confirm-btn').className     = 'btn btn-warn'
  document.getElementById('confirm-btn').onclick = async () => {
    try {
      await apiPost(`/outbreaks/${id}/resolve`, {})
      toast('บันทึกการยุติการระบาดแล้ว')
      closeModal('modal-confirm')
      resetConfirmBtn()
      await loadAdminOutbreaks(currentUser)
    } catch (e) {
      toast(e.message, 'error')
      resetConfirmBtn()
    }
  }
  openModal('modal-confirm')
}

function confirmDeleteOutbreak(id, currentUser) {
  document.getElementById('confirm-title').textContent = 'ลบบันทึกการระบาด?'
  document.getElementById('confirm-msg').textContent   = 'บันทึกนี้จะถูกลบอย่างถาวรและไม่สามารถเรียกคืนได้'
  document.getElementById('confirm-btn').textContent   = 'ลบรายการ'
  document.getElementById('confirm-btn').className     = 'btn btn-danger'
  document.getElementById('confirm-btn').onclick = async () => {
    try {
      await apiDelete(`/outbreaks/${id}`)
      toast('ลบบันทึกแล้ว')
      closeModal('modal-confirm')
      await loadAdminOutbreaks(currentUser)
    } catch (e) {
      toast(e.message, 'error')
    }
  }
  openModal('modal-confirm')
}
