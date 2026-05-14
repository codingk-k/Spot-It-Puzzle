import { get } from './request'

export function getDashboardStats() {
  return get('/admin/dashboard')
}

export function getDauTrend(params) {
  return get('/admin/dashboard/dau-trend', params)
}

export function getLevelCompletionRate() {
  return get('/admin/dashboard/level-completion')
}

export function getEloDistribution() {
  return get('/admin/dashboard/elo-distribution')
}
