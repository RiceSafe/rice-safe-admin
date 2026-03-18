import { apiGet, apiDelete } from '../api.js'
import { toast, openModal, closeModal, fmtDate, openDetailModal } from '../ui.js'

export async function loadCommunity(currentUser) {
  if (currentUser.role !== 'ADMIN') return // Security check

  document.getElementById('community-table-body').innerHTML = `<div class="loading">กำลังโหลด…</div>`
  try {
    const posts = await apiGet('/community/posts?limit=100') // fetch recent posts

    if (!posts.length) {
      document.getElementById('community-table-body').innerHTML =
        `<div class="empty-state">ไม่พบโพสต์ในชุมชน</div>`
      return
    }

    const el = document.getElementById('community-table-body')
    el.innerHTML = `
      <table>
        <thead><tr><th>ผู้เขียน</th><th>เนื้อหา</th><th>วันที่</th><th>จัดการ</th></tr></thead>
        <tbody>
          ${posts.map(p => `
            <tr id="community-row-${p.id}">
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <img src="${p.author_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + p.author_name}" width="24" height="24" style="border-radius:12px;"/>
                  <strong>${p.author_name}</strong>
                </div>
              </td>
              <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${p.content}
                ${p.image_url ? `<br/><span style="font-size:12px;color:var(--primary)">[มีภาพประกอบ]</span>` : ''}
              </td>
              <td style="color:var(--muted)">${fmtDate(p.created_at)}</td>
              <td>
                <button class="btn btn-danger btn-sm"
                  data-action="delete" data-id="${p.id}">
                  ลบ
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`

    el.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => confirmDeletePost(btn.dataset.id))
    })

    // Click to view post details
    el.querySelectorAll('tbody tr').forEach((row, index) => {
      row.style.cursor = 'pointer'
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return
        const p = posts[index]
        openDetailModal({
          title: `โพสต์โดย ${p.author_name}`,
          subtitle: fmtDate(p.created_at),
          image: p.image_url,
          content: `<p style="white-space:pre-wrap;">${p.content}</p>
                    <div style="font-size:12px;color:var(--muted);margin-top:12px;">ถูกใจ: ${p.like_count} • ความคิดเห็น: ${p.comment_count}</div>`
        })
      })
    })

  } catch (err) {
    document.getElementById('community-table-body').innerHTML =
      `<div class="empty-state">โหลดตารางโหลดโพสต์ล้มเหลว</div>`
  }
}

function confirmDeletePost(id) {
  document.getElementById('confirm-title').textContent = 'ลบโพสต์?'
  document.getElementById('confirm-msg').textContent   = 'คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้อย่างถาวร?'
  const btn = document.getElementById('confirm-btn')
  btn.textContent   = 'ลบ'
  btn.className     = 'btn btn-danger'
  
  btn.onclick = async () => {
    try {
      await apiDelete(`/community/posts/${id}`)
      toast('ลบโพสต์เรียบร้อยแล้ว')
      closeModal('modal-confirm')
      document.getElementById(`community-row-${id}`)?.remove()
    } catch (e) {
      toast(e.message, 'error')
    }
  }
  openModal('modal-confirm')
}
