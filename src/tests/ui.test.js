import { describe, it, expect } from 'vitest'
import { fmtDate, roleBadge, verifiedBadge, activeBadge } from '../ui.js'

describe('UI Helpers', () => {
  describe('fmtDate', () => {
    it('returns em-dash for null/empty input', () => {
      expect(fmtDate(null)).toBe('—')
      expect(fmtDate('')).toBe('—')
    })

    it('formats ISO string correctly', () => {
      const date = '2024-03-20T10:00:00Z'
      const formatted = fmtDate(date)
      expect(formatted).toMatch(/20 Mar 2024/)
    })
  })

  describe('roleBadge', () => {
    it('returns correct HTML for FARMER', () => {
      const html = roleBadge('FARMER')
      expect(html).toContain('role-badge role-FARMER')
      expect(html).toContain('ชาวนา')
    })

    it('returns correct HTML for ADMIN', () => {
      const html = roleBadge('ADMIN')
      expect(html).toContain('role-badge role-ADMIN')
      expect(html).toContain('ผู้ดูแลระบบ')
    })
  })

  describe('verifiedBadge', () => {
    it('returns green badge for true', () => {
      const html = verifiedBadge(true)
      expect(html).toContain('badge-green')
      expect(html).toContain('ตรวจสอบแล้ว')
    })

    it('returns yellow badge for false', () => {
      const html = verifiedBadge(false)
      expect(html).toContain('badge-yellow')
      expect(html).toContain('รอตรวจสอบ')
    })
  })

  describe('activeBadge', () => {
    it('returns outbreak badge for true/null/undefined', () => {
      expect(activeBadge(true)).toContain('กำลังระบาด')
      expect(activeBadge(undefined)).toContain('กำลังระบาด')
    })

    it('returns resolved badge for false', () => {
      expect(activeBadge(false)).toContain('ยุติแล้ว')
    })
  })
})
