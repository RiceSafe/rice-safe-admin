import { apiGet, apiPost, apiDelete } from '../api.js'
import { toast, openModal, closeModal, fmtDate, openDetailModal } from '../ui.js'

export async function loadPendingVerification(currentUser) {
  document.getElementById('verify-table-body').innerHTML = `<div class="loading">กำลังโหลด…</div>`
  try {
    const outbreaks = await apiGet('/outbreaks')
    const pending = outbreaks.filter(o => !o.is_verified)

    if (!pending.length) {
      document.getElementById('verify-table-body').innerHTML =
        `<div class="empty-state">ข้อมูลการระบาดทั้งหมดได้รับการตรวจสอบแล้ว</div>`
      return
    }

    const isExpert = currentUser.role === 'EXPERT'
    const el = document.getElementById('verify-table-body')
    el.innerHTML = `
      <table>
        <thead>
          <tr>
            <th style="width:50px;">รูป</th>
            <th>โรคข้าว</th>
            <th>สถานที่</th>
            <th>รายงานเมื่อ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          ${pending.map(o => `
            <tr id="verify-row-${o.id}">
              <td><img src="${o.image_url || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=No+Img'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"/></td>
              <td><strong>${o.disease_name || '—'}</strong></td>
              <td style="color:var(--muted)">${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)}</td>
              <td style="color:var(--muted)">${fmtDate(o.created_at)}</td>
              <td>
                <div class="table-actions">
                  ${isExpert
                    ? `<button class="btn btn-warn btn-sm" data-action="verify" data-id="${o.id}">ยืนยัน</button>`
                    : ''}
                  <button class="btn btn-danger btn-sm" data-action="delete" data-id="${o.id}">ลบรายการ</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`

    el.querySelectorAll('[data-action="verify"]').forEach(btn => {
      btn.addEventListener('click', () => verifyOutbreak(btn.dataset.id, btn, currentUser))
    })
    el.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => confirmDeleteOutbreak(btn.dataset.id, 'verify-row'))
    })

    // Click row to view details
    el.querySelectorAll('tbody tr').forEach((row, index) => {
      row.style.cursor = 'pointer'
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return
        const o = pending[index]
        openDetailModal({
          title: o.disease_name || 'ไม่ทราบชื่อโรค',
          subtitle: `${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)} — ${fmtDate(o.created_at)}`,
          image: o.image_url,
          content: `<strong>สถานะ:</strong> ${o.is_active ? 'กำลังระบาด' : 'ยุติการระบาด'}<br/><strong>การตรวจสอบ:</strong> ${o.is_verified ? 'ตรวจสอบแล้วโดยผู้เชี่ยวชาญ' : 'รอการตรวจสอบ'}`
        })
      })
    })
  } catch {
    document.getElementById('verify-table-body').innerHTML =
      `<div class="empty-state">โหลดข้อมูลล้มเหลว</div>`
  }
}

export async function verifyOutbreak(id, btnEl, currentUser) {
  if (currentUser.role !== 'EXPERT') {
    toast('เฉพาะผู้เชี่ยวชาญเท่านั้นที่สามารถยืนยันการระบาดได้', 'error')
    return
  }
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'กำลังยืนยัน…' }
  try {
    await apiPost(`/outbreaks/${id}/verify`, {})
    toast('ยืนยันการระบาดแล้ว')
    document.getElementById(`verify-row-${id}`)?.remove()
    document.getElementById(`dash-row-${id}`)?.remove()
  } catch (e) {
    toast(e.message, 'error')
    if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'ยืนยัน' }
  }
}

function confirmDeleteOutbreak(id, rowPrefix) {
  document.getElementById('confirm-title').textContent = 'ลบรายงานการระบาด?'
  document.getElementById('confirm-msg').textContent   =
    'รายงานการระบาดจะถูกลบอย่างถาวร หากเป็นรายงานที่ผิดพลาดหรือสแปม'
  document.getElementById('confirm-btn').textContent   = 'ลบรายการ'
  document.getElementById('confirm-btn').className     = 'btn btn-danger'
  document.getElementById('confirm-btn').onclick = async () => {
    try {
      await apiDelete(`/outbreaks/${id}`)
      toast('ลบรายงานแล้ว')
      closeModal('modal-confirm')
      document.getElementById(`${rowPrefix}-${id}`)?.remove()
      document.getElementById(`dash-row-${id}`)?.remove()
    } catch (e) {
      toast(e.message, 'error')
    }
  }
  openModal('modal-confirm')
}
