import { apiGet, apiPut } from '../api.js'
import { toast, openModal, closeModal, fmtDate, roleBadge } from '../ui.js'

export async function loadUsers() {
  document.getElementById('users-table-body').innerHTML = `<div class="loading">กำลังโหลด…</div>`
  try {
    const role  = document.getElementById('user-role-filter').value
    const users = await apiGet(`/users${role ? `?role=${role}` : ''}`)

    if (!users.length) {
      document.getElementById('users-table-body').innerHTML =
        `<div class="empty-state">ไม่พบผู้ใช้งาน</div>`
      return
    }

    const el = document.getElementById('users-table-body')
    el.innerHTML = `
      <table>
        <thead><tr><th>ชื่อผู้ใช้</th><th>อีเมล</th><th>สิทธิ์</th><th>เข้าร่วมเมื่อ</th><th>จัดการ</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><strong>${u.username}</strong></td>
              <td style="color:var(--muted)">${u.email}</td>
              <td>${roleBadge(u.role)}</td>
              <td style="color:var(--muted)">${fmtDate(u.created_at)}</td>
              <td>
                <button class="btn btn-ghost btn-sm"
                  data-id="${u.id}" data-username="${u.username}" data-role="${u.role}">
                  เปลี่ยนสิทธิ์
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`

    el.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () =>
        openRoleModal(btn.dataset.id, btn.dataset.username, btn.dataset.role)
      )
    })
  } catch {
    document.getElementById('users-table-body').innerHTML =
      `<div class="empty-state">โหลดข้อมูลผู้ใช้งานล้มเหลว</div>`
  }
}

function openRoleModal(id, username, currentRole) {
  document.getElementById('role-user-id').value = id
  document.getElementById('role-modal-sub').textContent = `เปลี่ยนสิทธิ์สำหรับ ${username}`
  document.getElementById('role-select').value = currentRole
  openModal('modal-role')
}

export async function saveRole() {
  const id   = document.getElementById('role-user-id').value
  const role = document.getElementById('role-select').value
  try {
    await apiPut(`/users/${id}/role`, { role })
    toast('อัปเดตสิทธิ์เรียบร้อยแล้ว')
    closeModal('modal-role')
    await loadUsers()
  } catch (e) {
    toast(e.message, 'error')
  }
}
