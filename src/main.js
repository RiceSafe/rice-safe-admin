import './style.css'
import { setToken, apiGet, apiPost } from './api.js'
import { initModalClose, toast, openModal, closeModal } from './ui.js'
import { loadDashboard }                         from './pages/dashboard.js'
import { initDiseases, loadDiseases, openDiseaseModal, saveDisease } from './pages/diseases.js'
import { loadAdminOutbreaks }                    from './pages/outbreaks.js'
import { loadPendingVerification }               from './pages/verify.js'
import { loadUsers, saveRole }                   from './pages/users.js'
import { loadCommunity }                           from './pages/community.js'

// ==== STATE ====
let currentUser = null
let token = localStorage.getItem('rs_admin_token') || ''

// ==== BOOT ====
window.addEventListener('DOMContentLoaded', async () => {
  initModalClose()
  wireStaticButtons()

  if (token) {
    setToken(token)
    try {
      const user = await apiGet('/auth/me')
      if (user.role !== 'ADMIN' && user.role !== 'EXPERT') throw new Error('Access denied')
      bootApp(user)
    } catch {
      token = ''
      localStorage.removeItem('rs_admin_token')
    }
  }
})

// ==== LOGIN ====
function wireStaticButtons() {
  document.getElementById('login-btn').addEventListener('click', handleLogin)
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin()
  })
  document.getElementById('logout-btn').addEventListener('click', logout)

  // Disease modal
  document.getElementById('add-disease-btn').addEventListener('click', () => openDiseaseModal())
  document.getElementById('disease-category-filter').addEventListener('change', loadDiseases)
  document.getElementById('save-disease-btn').addEventListener('click', saveDisease)

  // Role modal
  document.getElementById('save-role-btn').addEventListener('click', saveRole)

  // User filter
  document.getElementById('user-role-filter').addEventListener('change', loadUsers)

  // Nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page))
  })
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim()
  const pass  = document.getElementById('login-password').value
  const errEl = document.getElementById('login-error')
  errEl.textContent = ''
  if (!email || !pass) { errEl.textContent = 'กรุณากรอกข้อมูลให้ครบถ้วน'; return }

  const btn = document.getElementById('login-btn')
  btn.textContent = 'กำลังเข้าสู่ระบบ…'; btn.disabled = true

  try {
    const data = await apiPost('/auth/login', { email, password: pass })
    if (data.user.role !== 'ADMIN' && data.user.role !== 'EXPERT') {
      throw new Error('ปฏิเสธการเข้าถึง: รหัสของคุณไม่ใช่บัญชีผู้ดูแลระบบหรือผู้เชี่ยวชาญ')
    }
    token = data.token
    localStorage.setItem('rs_admin_token', token)
    setToken(token)
    bootApp(data.user)
  } catch (e) {
    errEl.textContent = e.message
    btn.textContent = 'เข้าสู่ระบบ'; btn.disabled = false
  }
}

function bootApp(user) {
  currentUser = user
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('app').style.display = 'flex'

  document.getElementById('sidebar-username').textContent = user.username
  const roleTh = { FARMER: 'ชาวนา', EXPERT: 'ผู้เชี่ยวชาญ', ADMIN: 'ผู้ดูแลระบบ' }[user.role] || user.role
  const roleEl = document.getElementById('sidebar-role')
  roleEl.textContent = roleTh
  roleEl.className = `role-badge role-${user.role}`
  document.getElementById('sidebar-avatar').textContent = user.username[0].toUpperCase()

  // Show admin-only nav items
  if (user.role === 'ADMIN') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '')
  }

  // Init modules that need currentUser
  initDiseases(user)

  showPage('dashboard')
}

function logout() {
  token = ''
  localStorage.removeItem('rs_admin_token')
  location.reload()
}

// ==== NAVIGATION ====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))

  document.getElementById(`page-${name}`)?.classList.add('active')
  document.querySelector(`.nav-item[data-page="${name}"]`)?.classList.add('active')

  if (name === 'dashboard')  loadDashboard(currentUser)
  if (name === 'diseases')   loadDiseases()
  if (name === 'outbreaks')  loadAdminOutbreaks(currentUser)
  if (name === 'verify')     loadPendingVerification(currentUser)
  if (name === 'users')      loadUsers()
  if (name === 'community')  loadCommunity(currentUser)
}
