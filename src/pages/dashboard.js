import { apiGet, publicGet } from '../api.js'
import { fmtDate, verifiedBadge, activeBadge, openDetailModal } from '../ui.js'
import { verifyOutbreak } from './verify.js'

export async function loadDashboard(currentUser) {
  try {
    const diseases = await publicGet('/diseases')

    // Call unified endpoint
    const outbreaks = await apiGet('/outbreaks')

    const pending = outbreaks.filter(o => !o.is_verified)
    const active  = outbreaks.filter(o => o.is_active !== false)

    document.getElementById('stat-diseases').textContent  = diseases.length
    document.getElementById('stat-outbreaks').textContent = active.length
    document.getElementById('stat-pending').textContent   = pending.length

    if (currentUser.role === 'ADMIN') {
      const users = await apiGet('/users')
      document.getElementById('stat-users').textContent = users.length
    }

    renderMiniOutbreaks(pending.slice(0, 5), currentUser)
  } catch (e) {
    console.error(e)
    document.getElementById('dashboard-outbreaks-body').innerHTML =
      `<div class="empty-state">โหลดข้อมูลล้มเหลว</div>`
  }
}

function renderMiniOutbreaks(rows, currentUser) {
  const el = document.getElementById('dashboard-outbreaks-body')
  if (!rows.length) {
    el.innerHTML = `<div class="empty-state">ไม่มีการระบาดที่รอตรวจสอบ</div>`
    return
  }
  el.innerHTML = `
    <table>
      <thead><tr><th style="width:50px;">รูป</th><th>โรคข้าว</th><th>สถานที่</th><th>รายงานเมื่อ</th><th>จัดการ</th></tr></thead>
      <tbody>
        ${rows.map(o => `
          <tr id="dash-row-${o.id}">
            <td><img src="${o.image_url || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=No+Img'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"/></td>
            <td><strong>${o.disease_name || 'ไม่ทราบชื่อโรค'}</strong></td>
            <td style="color:var(--muted)">${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)}</td>
            <td style="color:var(--muted)">${fmtDate(o.created_at)}</td>
            <td>
              ${currentUser.role === 'EXPERT' ? `
                <button class="btn btn-warn btn-sm" data-id="${o.id}" data-page="dashboard">
                  ตรวจสอบ
                </button>
              ` : `<span style="color:var(--muted)">อ่านข้อมูล</span>`}
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`

    el.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => verifyOutbreak(btn.dataset.id, btn, currentUser))
  })

  // Add click to view details (skip buttons)
  el.querySelectorAll('tbody tr').forEach((row, index) => {
    row.style.cursor = 'pointer'
    row.addEventListener('click', (e) => {
      if (e.target.closest('button')) return
      const o = rows[index]
      openDetailModal({
        title: o.disease_name || 'ไม่ทราบชื่อโรค',
        subtitle: `${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)} — ${fmtDate(o.created_at)}`,
        image: o.image_url,
        content: `<strong>สถานะ:</strong> ${o.is_active ? 'กำลังระบาด' : 'ยุติการระบาด'}<br/><strong>การตรวจสอบ:</strong> ${o.is_verified ? 'ตรวจสอบแล้วโดยผู้เชี่ยวชาญ' : 'รอการตรวจสอบ'}`
      })
    })
  })
}
