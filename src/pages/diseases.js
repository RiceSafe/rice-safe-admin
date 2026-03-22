import { apiGet, apiPost, apiPut, publicGet, apiUploadImage } from '../api.js'
import { toast, openModal, closeModal } from '../ui.js'

let _currentUser = null

export function initDiseases(currentUser) {
  _currentUser = currentUser

  // Attach upload event listener
  const fileInput = document.getElementById('disease-image-file')
  if (fileInput && !fileInput.dataset.bound) {
    fileInput.dataset.bound = "true"
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const urlInput = document.getElementById('disease-image-url')
      const prev = document.getElementById('disease-image-preview')
      urlInput.value = ''

      try {
        const res = await apiUploadImage(file)
        // CRITICAL: We MUST save the raw filename (e.g. dev/xxxx.jpg) into the form,
        // NOT the temporary signed URL, otherwise the DB gets corrupted!
        urlInput.value = res.filename
        prev.src = res.url
        prev.style.display = 'block'
        toast('อัปโหลดรูปภาพเรียบร้อยแล้ว')
      } catch (err) {
        toast('อัปโหลดรูปภาพล้มเหลว: ' + err.message, 'error')
      }
      e.target.value = '' // reset
    })
  }
}

export async function loadDiseases() {
  document.getElementById('diseases-table-body').innerHTML = `<div class="loading">กำลังโหลด…</div>`

  // "Add Disease" button: only EXPERT can add/edit
  const addBtn = document.getElementById('add-disease-btn')
  if (_currentUser?.role === 'EXPERT') {
    addBtn.style.display = ''
  } else {
    addBtn.style.display = 'none'
  }

  try {
    const diseases = await publicGet('/diseases')
    const cats = await publicGet('/diseases/categories')

    const sel = document.getElementById('disease-category-filter')
    const cur = sel.value
    sel.innerHTML = `<option value="">ทุกหมวดหมู่</option>` +
      cats.map(c => `<option value="${c}" ${c === cur ? 'selected' : ''}>${c}</option>`).join('')

    const filtered = cur ? diseases.filter(d => d.category === cur) : diseases
    renderDiseaseTable(filtered)
  } catch {
    document.getElementById('diseases-table-body').innerHTML =
      `<div class="empty-state">โหลดข้อมูลล้มเหลว</div>`
  }
}

function renderDiseaseTable(diseases) {
  const el = document.getElementById('diseases-table-body')
  const canEdit = _currentUser?.role === 'EXPERT'

  if (!diseases.length) {
    el.innerHTML = `<div class="empty-state">ไม่พบข้อมูลโรคข้าว</div>`
    return
  }

  el.innerHTML = `
    <table>
      <thead>
        <tr>
          <th style="width:50px;">รูป</th>
          <th>ชื่อโรค</th>
          <th>ชื่อเรียกในระบบ</th>
          <th>หมวดหมู่</th>
          <th>อาการ</th>
          <th>สภาพอากาศ</th>
          ${canEdit ? '<th>จัดการ</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${diseases.map(d => `
          <tr id="disease-row-${d.id}">
            <td><img src="${d.image_url || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=No+Img'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"/></td>
            <td><strong>${d.name}</strong><br/><small style="color:var(--muted)">${d.spread_details?.substring(0, 40) || ''}...</small></td>
            <td style="color:var(--muted);font-family:monospace">${d.alias}</td>
            <td><span class="badge badge-blue">${d.category}</span></td>
            <td style="color:var(--muted)">${d.symptoms?.length ?? 0} อาการ</td>
            <td style="color:var(--muted)">${d.match_weather?.join(', ') || '—'}</td>
            ${canEdit ? `<td><button class="btn btn-ghost btn-sm" data-id="${d.id}">แก้ไข</button></td>` : ''}
          </tr>`).join('')}
      </tbody>
    </table>`

  if (canEdit) {
    el.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => loadAndOpenDiseaseModal(btn.dataset.id))
    })
  }
}

// Fetch full disease detail then open modal (list may not include all fields)
async function loadAndOpenDiseaseModal(id) {
  try {
    const disease = await apiGet(`/diseases/${id}`)
    openDiseaseModal(disease)
  } catch {
    toast('โหลดข้อมูลโรคข้าวล้มเหลว', 'error')
  }
}

export function openDiseaseModal(disease = null) {
  document.getElementById('disease-id').value = disease?.id || ''
  document.getElementById('disease-name').value = disease?.name || ''
  document.getElementById('disease-alias').value = disease?.alias || ''
  document.getElementById('disease-category').value = disease?.category || ''
  document.getElementById('disease-image-url').value = disease?.image_url || ''

  const prev = document.getElementById('disease-image-preview')
  if (disease?.image_url) {
    prev.src = disease.image_url
    prev.style.display = 'block'
  } else {
    prev.style.display = 'none'
    prev.src = ''
  }

  document.getElementById('disease-description').value = disease?.description || ''
  document.getElementById('disease-spread').value = disease?.spread_details || ''
  document.getElementById('disease-weather').value = (disease?.match_weather || []).join(', ')

  // Render InfoSection arrays as JSON for the textarea
  document.getElementById('disease-symptoms').value = formatSections(disease?.symptoms)
  document.getElementById('disease-prevention').value = formatSections(disease?.prevention)
  document.getElementById('disease-treatment').value = formatSections(disease?.treatment)

  document.getElementById('disease-modal-title').textContent = disease?.id ? 'แก้ไขโรคข้าว' : 'เพิ่มโรคข้าว'
  openModal('modal-disease')
}

function formatSections(sections) {
  if (!sections || !sections.length) return ''
  return sections.map(s => `${s.title}\n${s.description}`).join('\n\n')
}

function parseSections(raw) {
  if (!raw?.trim()) return []
  // Each block separated by blank line: first line = title, rest = description
  return raw.trim().split(/\n\n+/).map(block => {
    const lines = block.split('\n')
    return { title: lines[0] || '', description: lines.slice(1).join('\n') || '' }
  }).filter(s => s.title)
}

export async function saveDisease() {
  const id = document.getElementById('disease-id').value
  const weatherRaw = document.getElementById('disease-weather').value.trim()

  const body = {
    name: document.getElementById('disease-name').value.trim(),
    alias: document.getElementById('disease-alias').value.trim(),
    category: document.getElementById('disease-category').value.trim(),
    image_url: document.getElementById('disease-image-url').value.trim(),
    description: document.getElementById('disease-description').value.trim(),
    spread_details: document.getElementById('disease-spread').value.trim(),
    match_weather: weatherRaw ? weatherRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
    symptoms: parseSections(document.getElementById('disease-symptoms').value),
    prevention: parseSections(document.getElementById('disease-prevention').value),
    treatment: parseSections(document.getElementById('disease-treatment').value),
  }

  if (!body.name || !body.alias || !body.category) {
    toast('กรุณากรอกชื่อโรค ชื่อเรียกในระบบ และหมวดหมู่ให้ครบถ้วน', 'error')
    return
  }

  try {
    if (id) {
      await apiPut(`/diseases/${id}`, body)
      toast('อัปเดตข้อมูลโรคข้าวแล้ว')
    } else {
      await apiPost('/diseases', body)
      toast('เพิ่มข้อมูลโรคข้าวแล้ว')
    }
    closeModal('modal-disease')
    await loadDiseases()
  } catch (e) {
    toast(e.message, 'error')
  }
}
