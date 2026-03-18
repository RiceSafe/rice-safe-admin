import { apiGet, apiPost, apiDelete, apiPut } from '../api.js'
import { toast, openModal, closeModal, fmtDate, verifiedBadge, activeBadge, openDetailModal } from '../ui.js'

export async function loadAdminOutbreaks(currentUser) {
  document.getElementById('outbreaks-table-body').innerHTML = `<div class="loading">Loading…</div>`
  try {
    const outbreaks = await apiGet('/outbreaks')
    renderOutbreakTable(outbreaks, currentUser)
  } catch {
    document.getElementById('outbreaks-table-body').innerHTML =
      `<div class="empty-state">โหลดข้อมูลล้มเหลว</div>`
  }
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
                ${isAdmin
                  ? `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${o.id}">ลบ</button>`
                  : ''}
                ${isExpert && !o.is_verified
                  ? `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${o.id}">ลบ</button>`
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

  // Add click to view details
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
      // Reset confirm button style
      document.getElementById('confirm-btn').className = 'btn btn-danger'
      document.getElementById('confirm-btn').textContent = 'ลบ'
      await loadAdminOutbreaks(currentUser)
    } catch (e) {
      toast(e.message, 'error')
      document.getElementById('confirm-btn').className = 'btn btn-danger'
      document.getElementById('confirm-btn').textContent = 'ลบ'
    }
  }
  openModal('modal-confirm')
}

function confirmDeleteOutbreak(id, currentUser) {
  document.getElementById('confirm-title').textContent = 'ลบบันทึกการระบาด?'
  document.getElementById('confirm-msg').textContent   = 'บันทึกนี้จะถูกลบอย่างถาวรและไม่สามารถเรียกคืนได้'
  document.getElementById('confirm-btn').textContent   = 'ลบ'
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
